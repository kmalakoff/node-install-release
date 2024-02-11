var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var resolveVersions = require('node-resolve-versions');

var installRelease = require('node-install-release');
var validateInstall = require('../lib/validateInstall');

var TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
var INSTALLED_DIR = path.join(TMP_DIR, 'installed');
var OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
  buildDirectory: path.join(TMP_DIR, 'build'),
};
var VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' });
// VERSIONS = ['v4'];
// VERSIONS = ['v6'];
// VERSIONS = ['v16'];

var TARGETS = [{ platform: 'darwin', arch: 'x64' }, { platform: 'linux', arch: 'x64' }, { platform: 'win32', arch: 'x64' }, {}];
// TARGETS = [{}];
// TARGETS = [{ platform: 'win32', arch: 'x64' }];
TARGETS = [{ platform: 'darwin', arch: 'x64' }];

// remove NODE_OPTIONS from ts-dev-stack
// biome-ignore lint/performance/noDelete: <explanation>
delete process.env.NODE_OPTIONS;

function addTests(version, target) {
  var platform = target.platform || 'local';
  var arch = target.arch || 'local';

  describe(`${version} (${platform},${arch})`, () => {
    it('dist', (done) => {
      var installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      installRelease(version, installPath, Object.assign({}, target, OPTIONS), (err) => {
        assert.ok(!err);
        validateInstall(version, installPath, target, done);
      });
    });

    it('promise', (done) => {
      var installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-promise`);
      installRelease(version, installPath, Object.assign({}, target, OPTIONS))
        .then((_res) => {
          validateInstall(version, installPath, target, done);
        })
        .catch(done);
    });

    it.skip('source', (done) => {
      var installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-src`);
      installRelease(version, installPath, Object.assign({ filename: 'src' }, OPTIONS), (err, _res) => {
        assert.ok(!err);
        validateInstall(version, installPath, done);
      });
    });
  });
}

describe('install-release', () => {
  before((callback) => {
    rimraf(INSTALLED_DIR, () => {
      rimraf(TMP_DIR, callback.bind(null, null));
    });
  });

  for (var i = 0; i < VERSIONS.length; i++) {
    for (var j = 0; j < TARGETS.length; j++) {
      addTests(VERSIONS[i], TARGETS[j]);
    }
  }
});
