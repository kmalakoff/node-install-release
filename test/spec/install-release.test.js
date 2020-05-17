var assert = require('assert');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var installRelease = require('../..');

var TEST_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp', 'test'));

function validateInstall(installPath) {
  try {
    fs.accessSync(path.join(installPath, 'bin', 'node'));
    fs.accessSync(path.join(installPath, 'bin', 'npm'));
    // try {
    //   fs.accessSync(path.join(installPath, 'bin', 'npx'));
    // } catch (err) {
    //   fs.accessSync(path.join(installPath, 'bin', 'node-waf'));
    // }
    fs.accessSync(path.join(installPath, 'include', 'node'));
    fs.accessSync(path.join(installPath, 'lib', 'node_modules', 'npm'));
  } catch (err) {
    assert(!err, err.message);
  }
}

function validateWin32(installPath) {
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
}

describe('alwaysStat', function () {
  // beforeEach(rimraf.bind(null, TEST_DIR));
  // after(rimraf.bind(null, TEST_DIR));

  describe('install-release', function () {
    describe('happy path', function () {
      it('v12 (darwin,x64)', function (done) {
        var installPath = path.join(TEST_DIR, 'v12-darwin-x64');
        installRelease('v12', installPath, { platform: 'darwin', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          validateInstall(installPath);
          done();
        });
      });

      it('v12 (win32,x64)', function (done) {
        var installPath = path.join(TEST_DIR, 'v12-win32-x64');
        installRelease('v12', installPath, { platform: 'win32', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          validateWin32(installPath);
          done();
        });
      });

      it('v12 (linux,x64)', function (done) {
        var installPath = path.join(TEST_DIR, 'v12-linux-x64');
        installRelease('v12', installPath, { platform: 'linux', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          validateInstall(installPath);
          done();
        });
      });
      it('v0.8 (darwin,x64)', function (done) {
        var installPath = path.join(TEST_DIR, 'v0.8-darwin-x64');
        installRelease('v0.8', installPath, { platform: 'darwin', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          validateInstall(installPath);
          done();
        });
      });

      it('v0.8 (win32,x64)', function (done) {
        var installPath = path.join(TEST_DIR, 'v0.8-win32-x64');
        installRelease('v0.8', installPath, { platform: 'win32', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          validateWin32(installPath);
          done();
        });
      });

      it('v0.8 (linux,x64)', function (done) {
        var installPath = path.join(TEST_DIR, 'v0.8-linux-x64');
        installRelease('v0.8', installPath, { platform: 'linux', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          validateInstall(installPath);
          done();
        });
      });
    });

    describe('unhappy path', function () {});
  });
});
