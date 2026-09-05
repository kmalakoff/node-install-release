import assert from 'assert';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import { createServer } from 'http';
import path from 'path';
import url from 'url';
import conditionalCache from '../../../src/lib/conditionalCache.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', '..', '.tmp', 'conditionalCache');

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

describe('lib/conditionalCache', () => {
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
      conditionalCache(endpoint, dest, {}, (err) => {
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
      conditionalCache(endpoint, dest, {}, (err) => {
        server.close();
        assert.equal(err, undefined);
        assert.equal(fs.readFileSync(dest, 'utf8'), 'the body');
        done();
      });
    });
  });
});
