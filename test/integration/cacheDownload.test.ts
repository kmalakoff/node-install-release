import assert from 'assert';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import { createServer } from 'http';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import url from 'url';
import cacheDownload from '../../src/lib/cacheDownload.ts';
import isNonEmptyFile from '../../src/lib/isNonEmptyFile.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '..', '.tmp', 'cacheDownload');

// get-file-compat routes every Node 0.x fetch through a synchronous child process, freezing
// this process's event loop before it could ever answer a request against its own server
const isNodeMajorZero = +process.versions.node.split('.')[0] === 0;

// a real local server, not nodejs.org: a fixed status and body with none of a live host's flakiness
function listen(server: ReturnType<typeof createServer>, callback: (endpoint: string) => void): void {
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    callback(`http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`);
  });
}

describe('lib/cacheDownload', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  it('a non-2xx response is not cached', function (done) {
    if (isNodeMajorZero) return this.skip();
    const server = createServer((_req, res) => {
      res.writeHead(404);
      res.end('not found');
    });
    listen(server, (endpoint) => {
      const dest = path.join(TMP_DIR, 'missing.txt');
      cacheDownload(endpoint, dest, isNonEmptyFile, (err) => {
        server.close();
        assert.ok(err);
        assert.ok(/^HTTP 404 /.test(err?.message || ''), err?.message);
        assert.equal(fs.existsSync(dest), false);
        done();
      });
    });
  });

  it('a 2xx response is written to dest', function (done) {
    if (isNodeMajorZero) return this.skip();
    const server = createServer((_req, res) => {
      res.writeHead(200);
      res.end('the body');
    });
    listen(server, (endpoint) => {
      const dest = path.join(TMP_DIR, 'found.txt');
      cacheDownload(endpoint, dest, isNonEmptyFile, (err) => {
        server.close();
        assert.equal(err, undefined);
        assert.equal(fs.readFileSync(dest, 'utf8'), 'the body');
        done();
      });
    });
  });

  it('a non-2xx body is never at dest, not even briefly', function (done) {
    if (isNodeMajorZero) return this.skip();
    const server = createServer((_req, res) => {
      res.writeHead(404);
      res.end('not found');
    });
    listen(server, (endpoint) => {
      const dest = path.join(TMP_DIR, 'never.txt');
      let seen = false;
      let finished = false;
      // a reader polling for the cache entry while the download is in flight
      const poll = () => {
        if (finished) return;
        if (fs.existsSync(dest)) seen = true;
        setImmediate(poll);
      };
      poll();
      cacheDownload(endpoint, dest, isNonEmptyFile, (err) => {
        finished = true;
        server.close();
        assert.ok(err);
        assert.equal(seen, false);
        done();
      });
    });
  });

  it('an empty file at dest is replaced by a fresh download', function (done) {
    if (isNodeMajorZero) return this.skip();
    const server = createServer((_req, res) => {
      res.writeHead(200);
      res.end('the body');
    });
    listen(server, (endpoint) => {
      const dest = path.join(TMP_DIR, 'empty.txt');
      mkdirp.sync(TMP_DIR);
      fs.writeFileSync(dest, '');
      cacheDownload(endpoint, dest, isNonEmptyFile, (err) => {
        server.close();
        assert.equal(err, undefined);
        assert.equal(fs.readFileSync(dest, 'utf8'), 'the body');
        done();
      });
    });
  });

  it('a file with content at dest is a hit and is not downloaded again', function (done) {
    if (isNodeMajorZero) return this.skip();
    let requests = 0;
    const server = createServer((_req, res) => {
      requests++;
      res.writeHead(200);
      res.end('from the server');
    });
    listen(server, (endpoint) => {
      const dest = path.join(TMP_DIR, 'hit.txt');
      mkdirp.sync(TMP_DIR);
      fs.writeFileSync(dest, 'already here');
      cacheDownload(endpoint, dest, isNonEmptyFile, (err) => {
        server.close();
        assert.equal(err, undefined);
        assert.equal(requests, 0);
        assert.equal(fs.readFileSync(dest, 'utf8'), 'already here');
        done();
      });
    });
  });
});
