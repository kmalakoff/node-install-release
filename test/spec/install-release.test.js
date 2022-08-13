var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var resolveVersions = require('node-resolve-versions');

var installRelease = require('../..');
var validateInstall = require('../lib/validateInstall');

var TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
var INSTALLED_DIR = path.join(TMP_DIR, 'installed');
var OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
  buildDirectory: path.join(TMP_DIR, 'build'),
};
var VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' })
// VERSIONS = ['v4'];
var TARGETS = [{ platform: 'darwin', arch: 'x64' }, { platform: 'linux', arch: 'x64' }, { platform: 'win32', arch: 'x64' }, {}];
// TARGETS = [{}];
// TARGETS = [{ platform: 'win32', arch: 'x64' }];

function addTests(version, target) {
  var platform = target.platform || 'local';
  var arch = target.arch || 'local';

  describe(version + ' (' + platform + ',' + arch + ')', function () {
    it.only('dist', function (done) {
      var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch);
      installRelease(version, installPath, Object.assign({}, target, OPTIONS), function (err) {
        assert.ok(!err);
        validateInstall(version, installPath, target, done);
      });
    });

    it('promise', function (done) {
      var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch + '-promise');
      installRelease(version, installPath, Object.assign({}, target, OPTIONS))
        .then(function (res) {
          validateInstall(version, installPath, target, done);
        })
        .catch(done);
    });
  });

  it.skip('source', function (done) {
    var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch + '-src');
    installRelease(version, installPath, Object.assign({ filename: 'src' }, OPTIONS), function (err, res) {
      assert.ok(!err);
      validateInstall(version, installPath);
    });
  });
}

describe('install-release', function () {
  before(function (callback) {
    rimraf(INSTALLED_DIR, function () {
      rimraf(TMP_DIR, callback.bind(null, null));
    });
  });

  describe('happy path', function () {
    for (var i = 0; i < VERSIONS.length; i++) {
      for (var j = 0; j < TARGETS.length; j++) {
        addTests(VERSIONS[i], TARGETS[j]);
      }
    }
  });

  // TODO
  describe('unhappy path', function () {});
});
