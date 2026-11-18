import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import http from 'http';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import url from 'url';
import { NODE_DIST_BASE_URL } from '../../../src/constants.ts';
import downloadValidated from '../../../src/installNode/downloadValidated.ts';
import type { ResolvedInstallOptions } from '../../../src/types.ts';

// reaches nodejs.org: a real release artifact and its published SHASUMS256.txt
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '..', '.tmp', 'downloadValidated');
const DIST_PATH = 'v0.8.28/node.exe';
const DOWNLOAD_PATH = `${NODE_DIST_BASE_URL}/${DIST_PATH}`;
const CACHE_PATH = path.join(TMP_DIR, 'node-v0.8.28.exe');
const OPTIONS = { cachePath: TMP_DIR } as unknown as ResolvedInstallOptions;

// get-file-compat routes every Node 0.x fetch through a synchronous child process, freezing
// this process's event loop before it could ever answer a request against its own server
const isNodeMajorZero = +process.versions.node.split('.')[0] === 0;

function sha256(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

describe('installNode/downloadValidated', () => {
  beforeEach((cb) => safeRm(TMP_DIR, (err) => (err ? cb(err) : mkdirp(TMP_DIR, (err) => cb(err)))));
  after((cb) => safeRm(TMP_DIR, cb));

  it('replaces a corrupt cached file with a valid download', (done) => {
    fs.writeFileSync(CACHE_PATH, 'truncated');
    downloadValidated(DIST_PATH, DOWNLOAD_PATH, CACHE_PATH, OPTIONS, (err, checksum) => {
      if (err) return done(err);
      assert.ok(checksum?.match);
      assert.equal(sha256(CACHE_PATH), checksum?.expected);
      done();
    });
  });

  it('does not download a valid cached file again', (done) => {
    downloadValidated(DIST_PATH, DOWNLOAD_PATH, CACHE_PATH, OPTIONS, (err) => {
      if (err) return done(err);
      const before = fs.statSync(CACHE_PATH).mtime.getTime();
      setTimeout(() => {
        downloadValidated(DIST_PATH, DOWNLOAD_PATH, CACHE_PATH, OPTIONS, (err, checksum) => {
          if (err) return done(err);
          assert.ok(checksum?.match);
          assert.equal(fs.statSync(CACHE_PATH).mtime.getTime(), before);
          done();
        });
      }, 1100);
    });
  });

  it('removes a file that fails validation after the retry', (done) => {
    // a checksum entry for another file name: the download can never match it
    downloadValidated('v0.8.28/node-no-such.exe', DOWNLOAD_PATH, CACHE_PATH, OPTIONS, (err, checksum) => {
      assert.ok(err);
      assert.equal(checksum?.match, false);
      assert.equal(fs.existsSync(CACHE_PATH), false);
      done();
    });
  });

  it('fetches a download that fails its checksum once more', function (done) {
    if (isNodeMajorZero) return this.skip();
    // a real server: the first body is wrong, the second is the real file
    downloadValidated(DIST_PATH, DOWNLOAD_PATH, CACHE_PATH, OPTIONS, (err) => {
      if (err) return done(err);
      const good = fs.readFileSync(CACHE_PATH);
      fs.unlinkSync(CACHE_PATH);
      let requests = 0;
      const server = http.createServer((_req, res) => {
        requests++;
        res.end(requests === 1 ? Buffer.from('not the release') : good);
      });
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as { port: number };
        downloadValidated(DIST_PATH, `http://127.0.0.1:${address.port}/node.exe`, CACHE_PATH, OPTIONS, (err, checksum) => {
          server.close();
          if (err) return done(err);
          assert.equal(requests, 2);
          assert.ok(checksum?.match);
          assert.equal(sha256(CACHE_PATH), checksum?.expected);
          done();
        });
      });
    });
  });
});
