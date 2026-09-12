var assert = require('assert');
var path = require('path');
var assign = require('object.assign');
var rimraf = require('rimraf');
var crossSpawn = require('cross-spawn-cb');

var installRelease = require('../..');
var validateInstall = require('../lib/validateInstall');

var CLI = path.join(__dirname, '..', '..', 'bin', 'node-install-release');
var TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
var INSTALLED_DIR = path.join(TMP_DIR, 'installed');
var OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
};

describe('install-release', function () {
  // before(function (callback) {
  //   rimraf(INSTALLED_DIR, function () {
  //     rimraf(OPTIONS.cacheDirectory, callback.bind(null, null));
  //   });
  // });

  describe('happy path', function () {
    // TODO: remove platform specific after troubleshooting decompress on windows
    if (process.platform !== 'win32') {
      it('v12 (darwin,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v12-darwin-x64');

        installRelease('v12', installPath, assign({ platform: 'darwin', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'darwin' });
          done();
        });
      });

      it('v12 (linux,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v12-linux-x64');
        installRelease('v12', installPath, assign({ platform: 'linux', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'linux' });
          done();
        });
      });
    }

    it('v12 (win32,x64)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v12-win32-x64');
      installRelease('v12', installPath, assign({ platform: 'win32', arch: 'x64' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath, { platform: 'win32' });
        done();
      });
    });

    it('v12 (local)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v12-local');
      installRelease('v12', installPath, OPTIONS, function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });

    it.skip('v12 (local src)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v12-local-src');
      installRelease('v12', installPath, assign({ filename: 'src' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });

    // TODO: remove platform specific after troubleshooting decompress on windows
    if (process.platform !== 'win32') {
      it('v0.8 (darwin,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v0.8-darwin-x64');
        installRelease('v0.8', installPath, assign({ platform: 'darwin', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'darwin' });
          done();
        });
      });

      it('v0.8 (linux,x64)', function (done) {
        var installPath = path.join(INSTALLED_DIR, 'v0.8-linux-x64');
        installRelease('v0.8', installPath, assign({ platform: 'linux', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'linux' });
          done();
        });
      });
    }

    it('v0.8 (win32,x64)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v0.8-win32-x64');
      installRelease('v0.8', installPath, assign({ platform: 'win32', arch: 'x64' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath, { platform: 'win32' });
        done();
      });
    });

    it('v0.8 (local)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v0.8-local');
      installRelease('v0.8', installPath, OPTIONS, function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });

    it.skip('v0.8 (local src)', function (done) {
      var installPath = path.join(INSTALLED_DIR, 'v0.8-local-src');
      installRelease('v0.8', installPath, assign({ filename: 'src' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });
  });

  describe('unhappy path', function () {});
});

var assert = require('assert');
var path = require('path');

var NODE = process.platform === 'win32' ? 'node.exe' : 'node';
var EOL = /\r\n|\r|\n/;

describe('cli', function () {
  describe('happy path', function () {
    it('npm whoami', function (done) {
      crossSpawn(CLI, ['12', 'npm', 'whoami'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.ok(res.stdout.split(EOL).slice(-2, -1)[0].length > 1);
        done();
      });
    });

    it('12', function (done) {
      crossSpawn(CLI, ['12', 'node', '--version'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout.split(EOL).slice(-2, -1)[0], 'v12.16.3');
        done();
      });
    });

    it('one version with options', function (done) {
      crossSpawn(CLI, ['lts/argon', NODE, '--version'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout.split(EOL).slice(-2, -1)[0], 'v4.9.1');
        done();
      });
    });
  });

  describe('unhappy path', function () {
    it('err version (undefined)', function (done) {
      crossSpawn(CLI, [undefined], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.ok(res.code !== 0);
        done();
      });
    });

    it('err version (null)', function (done) {
      crossSpawn(CLI, [null, NODE, '--version'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.ok(res.code !== 0);
        done();
      });
    });

    it('invalid versions', function (done) {
      crossSpawn(CLI, ['junk', NODE, '--version'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.ok(res.code !== 0);
        done();
      });
    });
  });
});
