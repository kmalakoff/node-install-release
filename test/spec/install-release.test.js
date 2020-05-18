var assert = require('assert');
var path = require('path');
var fs = require('fs');
var assign = require('object.assign');
// var rimraf = require('rimraf');

var installRelease = require('../..');

var TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
var INSTALL_DIR = path.join(TMP_DIR, 'installed');
var OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
};

function validateInstall(installPath, options) {
  options = options || {};
  var platform = options.platform || process.platform;

  if (platform === 'win32') {
    try {
      fs.accessSync(path.join(installPath, 'node.exe'));
      fs.accessSync(path.join(installPath, 'npm'));
      fs.accessSync(path.join(installPath, 'npm.cmd'));
      // fs.accessSync(path.join(installPath, 'npx'));
      // fs.accessSync(path.join(installPath, 'npx.cmd'));
      // fs.accessSync(path.join(installPath, 'install_tools.bat'));
      fs.accessSync(path.join(installPath, 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
    }
  } else {
    try {
      fs.accessSync(path.join(installPath, 'bin', 'node'));
      fs.accessSync(path.join(installPath, 'bin', 'npm'));
      // try {
      //   fs.accessSync(path.join(installPath, 'bin', 'npx'));
      // } catch (err) {
      //   fs.accessSync(path.join(installPath, 'bin', 'node-waf'));
      // }
      // fs.accessSync(path.join(installPath, 'include', 'node'));
      fs.accessSync(path.join(installPath, 'lib', 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
    }
  }
}

describe('install-release', function () {
  // beforeEach(rimraf.bind(null, INSTALL_DIR));
  // after(rimraf.bind(null, INSTALL_DIR));

  describe('happy path', function () {
    // TODO: remove platform specific after troubleshooting decompress
    if (process.platform !== 'win32') {
      it('v12 (darwin,x64)', function (done) {
        var installPath = path.join(INSTALL_DIR, 'v12-darwin-x64');
        installRelease('v12', installPath, assign({ platform: 'darwin', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'darwin' });
          done();
        });
      });

      it('v12 (linux,x64)', function (done) {
        var installPath = path.join(INSTALL_DIR, 'v12-linux-x64');
        installRelease('v12', installPath, assign({ platform: 'linux', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'linux' });
          done();
        });
      });
    }

    it('v12 (win32,x64)', function (done) {
      var installPath = path.join(INSTALL_DIR, 'v12-win32-x64');
      installRelease('v12', installPath, assign({ platform: 'win32', arch: 'x64' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath, { platform: 'win32' });
        done();
      });
    });

    it('v12 (local)', function (done) {
      var installPath = path.join(INSTALL_DIR, 'v12-local');
      installRelease('v12', installPath, OPTIONS, function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });

    it('v12 (local src)', function (done) {
      var installPath = path.join(INSTALL_DIR, 'v12-local-src');
      installRelease('v12', installPath, assign({ filename: 'src' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });

    // TODO: remove platform specific after troubleshooting decompress
    if (process.platform !== 'win32') {
      it('v0.8 (darwin,x64)', function (done) {
        var installPath = path.join(INSTALL_DIR, 'v0.8-darwin-x64');
        installRelease('v0.8', installPath, assign({ platform: 'darwin', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'darwin' });
          done();
        });
      });

      it('v0.8 (linux,x64)', function (done) {
        var installPath = path.join(INSTALL_DIR, 'v0.8-linux-x64');
        installRelease('v0.8', installPath, assign({ platform: 'linux', arch: 'x64' }, OPTIONS), function (err, res) {
          assert.ok(!err);
          validateInstall(installPath, { platform: 'linux' });
          done();
        });
      });
    }

    it('v0.8 (win32,x64)', function (done) {
      var installPath = path.join(INSTALL_DIR, 'v0.8-win32-x64');
      installRelease('v0.8', installPath, assign({ platform: 'win32', arch: 'x64' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath, { platform: 'win32' });
        done();
      });
    });

    it('v0.8 (local)', function (done) {
      var installPath = path.join(INSTALL_DIR, 'v0.8-local');
      installRelease('v0.8', installPath, OPTIONS, function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });

    it.skip('v0.8 (local src)', function (done) {
      var installPath = path.join(INSTALL_DIR, 'v0.8-local-src');
      installRelease('v0.8', installPath, assign({ filename: 'src' }, OPTIONS), function (err, res) {
        assert.ok(!err);
        validateInstall(installPath);
        done();
      });
    });
  });

  describe('unhappy path', function () {});
});
