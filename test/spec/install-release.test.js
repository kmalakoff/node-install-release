var assert = require('assert');
var path = require('path');
var assign = require('object-assign');
var rimraf = require('rimraf');

var installRelease = require('../..');
var validateInstall = require('../lib/validateInstall');

var TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
var INSTALLED_DIR = path.join(TMP_DIR, 'installed');
var OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
  buildDirectory: path.join(TMP_DIR, 'build'),
};
var VERSIONS = ['v14', 'v12', 'v10', 'v8', 'v6', 'v4', 'v0.10', 'v0.8', 'v0.6'];
// var TARGETS = [{ platform: 'darwin', arch: 'x64' }, { platform: 'linux', arch: 'x64' }, { platform: 'win32', arch: 'x64' }, {}];
var TARGETS = [{}];

function addTests(version, target) {
  var platform = target.platform || 'local';
  var arch = target.arch || 'local';

  describe('dist', function () {
    it(version + ' (' + platform + ',' + arch + ')', function (done) {
      var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch);
      installRelease(version, installPath, assign({}, target, OPTIONS), function (err) {
        assert.ok(!err);
        validateInstall(installPath, target);
        done();
      });
    });

    it(version + ' (' + platform + ',' + arch + ')', function (done) {
      var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch);
      installRelease(version, installPath, assign({}, target, OPTIONS), function (err) {
        assert.ok(!err);
        validateInstall(installPath, target);
        done();
      });
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it(version + ' (' + platform + ',' + arch + ') - promise', function (done) {
      var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch + '-promise');
      installRelease(version, installPath, assign({}, target, OPTIONS))
        .then(function (res) {
          validateInstall(installPath, target);
          done();
        })
        .catch(done);
    });
  });

  describe.only('source', function () {
    it(version + ' (' + platform + ',' + arch + ') - src', function (done) {
      var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch + '-src');
      installRelease(version, installPath, assign({ filename: 'src' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });
  });
}

describe('install-release', function () {
  before(function (callback) {
    rimraf(INSTALLED_DIR, function () {
      rimraf(OPTIONS.cacheDirectory, callback.bind(null, null));
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
