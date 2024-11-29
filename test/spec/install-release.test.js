// remove NODE_OPTIONS from ts-dev-stack
// biome-ignore lint/performance/noDelete: <explanation>
delete process.env.NODE_OPTIONS;

const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const resolveVersions = require('node-resolve-versions');

const installRelease = require('node-install-release');
const validateInstall = require('../lib/validateInstall');

const TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
  buildDirectory: path.join(TMP_DIR, 'build'),
};
const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' });
// VERSIONS = ['v4'];
// VERSIONS = ['v6'];
// VERSIONS = ['v16'];

let TARGETS = [{ platform: 'darwin', arch: 'x64' }, { platform: 'linux', arch: 'x64' }, { platform: 'win32', arch: 'x64' }, {}];
// TARGETS = [{}];
// TARGETS = [{ platform: 'win32', arch: 'x64' }];
TARGETS = [{ platform: 'darwin', arch: 'x64' }];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';

  describe(`${version} (${platform},${arch})`, () => {
    it('dist', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      installRelease(version, installPath, Object.assign({}, target, OPTIONS), (err) => {
        assert.ok(!err, err ? err.message : '');
        validateInstall(version, installPath, target, done);
      });
    });

    it('promise', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-promise`);
      installRelease(version, installPath, Object.assign({}, target, OPTIONS))
        .then((_res) => {
          validateInstall(version, installPath, target, done);
        })
        .catch(done);
    });

    it.skip('source', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-src`);
      installRelease(version, installPath, Object.assign({ filename: 'src' }, OPTIONS), (err, _res) => {
        assert.ok(!err, err ? err.message : '');
        validateInstall(version, installPath, done);
      });
    });
  });
}

describe('install-release', () => {
  before((callback) => {
    rimraf2(INSTALLED_DIR, { disableGlob: true }, () => {
      rimraf2(TMP_DIR, { disableGlob: true }, callback.bind(null, null));
    });
  });

  for (let i = 0; i < VERSIONS.length; i++) {
    for (let j = 0; j < TARGETS.length; j++) {
      addTests(VERSIONS[i], TARGETS[j]);
    }
  }
});
