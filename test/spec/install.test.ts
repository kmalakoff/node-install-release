// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;
import Pinkie from 'pinkie-promise';

import assert from 'assert';
import path from 'path';
import url from 'url';
import rimraf2 from 'rimraf2';

// @ts-ignore
import installRelease from 'node-install-release';
import validateInstall from '../lib/validateInstall';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  storagePath: TMP_DIR,
};
const VERSIONS = ['v20', 'v0.8'];
// const VERSIONS = ['v0.8'];
const TARGETS = [{ platform: 'darwin' }, { platform: 'win32', arch: 'x64' }, { platform: 'linux', arch: 'x64' }, { platform: 'darwin', arch: 'arm64' }];
// const TARGETS = [{ platform: 'win32', arch: 'x64' }];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';

  describe(`${version} (${platform},${arch})`, () => {
    (() => {
      // patch and restore promise
      // @ts-ignore
      let rootPromise: Promise;
      before(() => {
        rootPromise = global.Promise;
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = rootPromise;
      });
    })();

    it('dist', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      installRelease(version, { installPath, ...target, ...OPTIONS }, (err, result) => {
        assert.ok(!err, err ? err.message : '');
        validateInstall(result.version, result.installPath, target, done);
      });
    });

    it('promise', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-promise`);
      installRelease(version, { installPath, ...target, ...OPTIONS })
        .then((result) => {
          validateInstall(result.version, result.installPath, target, done);
        })
        .catch(done);
    });

    it.skip('source', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-src`);
      installRelease(version, { installPath, filename: 'src', ...OPTIONS }, (err, result) => {
        assert.ok(!err, err ? err.message : '');
        validateInstall(result.version, result.installPath, done);
      });
    });
  });
}

describe('install-release', () => {
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));
  // after((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  for (let i = 0; i < VERSIONS.length; i++) {
    for (let j = 0; j < TARGETS.length; j++) {
      addTests(VERSIONS[i], TARGETS[j]);
    }
  }
});
