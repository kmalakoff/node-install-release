var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var crossSpawn = require('cross-spawn-cb');

var validateInstall = require('../lib/validateInstall');

var CLI = path.join(__dirname, '..', '..', 'bin', 'node-install-release');
var TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
var INSTALLED_DIR = path.join(TMP_DIR, 'installed');
var OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
};

describe('cli', function () {
  before(function (callback) {
    rimraf(INSTALLED_DIR, function () {
      rimraf(OPTIONS.cacheDirectory, callback.bind(null, null));
    });
  });

  describe('happy path', function () {
    // TODO: remove platform specific after troubleshooting decompress on windows
    if (process.platform !== 'win32') {
      it('v12 (darwin,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v12-darwin-x64');
        crossSpawn(
          CLI,
          ['v12', installPath, '--platform', 'darwin', '--arch', 'x64', '--cacheDirectory', OPTIONS.cacheDirectory],
          { stdio: 'inherit' },
          function (err, res) {
            assert.ok(!err);
            assert.equal(res.code, 0);
            validateInstall(installPath, { platform: 'darwin' });
            done();
          }
        );
      });

      it('v12 (linux,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v12-linux-x64');
        crossSpawn(
          CLI,
          ['v12', installPath, '--platform', 'linux', '--arch', 'x64', '--cacheDirectory', OPTIONS.cacheDirectory],
          { stdio: 'inherit' },
          function (err, res) {
            assert.ok(!err);
            assert.equal(res.code, 0);
            validateInstall(installPath, { platform: 'linux' });
            done();
          }
        );
      });
    }

    it('v12 (win32,x64)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v12-win32-x64');
      crossSpawn(CLI, ['v12', installPath, '--platform', 'win32', '--arch', 'x64', '--cacheDirectory', OPTIONS.cacheDirectory], { stdio: 'inherit' }, function (
        err,
        res
      ) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        validateInstall(installPath, { platform: 'win32' });
        done();
      });
    });

    it('v12 (local)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v12-local');
      crossSpawn(CLI, ['v12', installPath, '--cacheDirectory', OPTIONS.cacheDirectory], { stdio: 'inherit' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        validateInstall(installPath);
        done();
      });
    });

    // TODO: remove platform specific after troubleshooting decompress on windows
    if (process.platform !== 'win32') {
      it.skip('v12 (local src)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v12-local-src');
        crossSpawn(CLI, ['v12', installPath, '--filename', 'src', '--cacheDirectory', OPTIONS.cacheDirectory], { stdio: 'inherit' }, function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          validateInstall(installPath);
          done();
        });
      });
    }

    // TODO: remove platform specific after troubleshooting decompress on windows
    if (process.platform !== 'win32') {
      it('v0.8 (darwin,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v0.8-darwin-x64');
        crossSpawn(
          CLI,
          ['v0.8', installPath, '--platform', 'darwin', '--arch', 'x64', '--cacheDirectory', OPTIONS.cacheDirectory],
          { stdio: 'inherit' },
          function (err, res) {
            assert.ok(!err);
            assert.equal(res.code, 0);
            validateInstall(installPath, { platform: 'darwin' });
            done();
          }
        );
      });

      it('v0.8 (linux,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v0.8-linux-x64');
        crossSpawn(
          CLI,
          ['v0.8', installPath, '--platform', 'linux', '--arch', 'x64', '--cacheDirectory', OPTIONS.cacheDirectory],
          { stdio: 'inherit' },
          function (err, res) {
            assert.ok(!err);
            assert.equal(res.code, 0);
            validateInstall(installPath, { platform: 'linux' });
            done();
          }
        );
      });
    }

    it('v0.8 (win32,x64)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v0.8-win32-x64');
      crossSpawn(
        CLI,
        ['v0.8', installPath, '--platform', 'win32', '--arch', 'x64', '--cacheDirectory', OPTIONS.cacheDirectory],
        { stdio: 'inherit' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          validateInstall(installPath, { platform: 'win32' });
          done();
        }
      );
    });

    it('v0.8 (local)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v0.8-local');
      crossSpawn(CLI, ['v0.8', installPath, '--cacheDirectory', OPTIONS.cacheDirectory], { stdio: 'inherit' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        validateInstall(installPath);
        done();
      });
    });

    // TODO: remove platform specific after troubleshooting decompress on windows
    if (process.platform !== 'win32') {
      it.skip('v0.8 (local src)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v0.8-local-src');
        crossSpawn(CLI, ['v0.8', installPath, '--filename', 'src', '--cacheDirectory', OPTIONS.cacheDirectory], { stdio: 'inherit' }, function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          validateInstall(installPath);
          done();
        });
      });
    }
  });

  describe('unhappy path', function () {});
});
