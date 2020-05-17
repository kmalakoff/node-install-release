var assert = require('assert');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var installRelease = require('../..');

var TEST_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp', 'test'));

describe('alwaysStat', function () {
  // beforeEach(rimraf.bind(null, TEST_DIR));
  // after(rimraf.bind(null, TEST_DIR));

  describe('install-release', function () {
    describe('happy path', function () {
      it('v12 (darwin,x64)', function (done) {
        installRelease('v12', path.join(TEST_DIR, 'v12-darwin-x64'), { platform: 'darwin', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          done();
        });
      });

      it('v12 (win32,x64)', function (done) {
        installRelease('v12', path.join(TEST_DIR, 'v12-win32-x64'), { platform: 'win32', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          done();
        });
      });

      it('v12 (linux,x64)', function (done) {
        installRelease('v12', path.join(TEST_DIR, 'v12-linux-x64'), { platform: 'linux', arch: 'x64' }, function (err, res) {
          assert.ok(!err);
          done();
        });
      });
    });

    describe('unhappy path', function () {});
  });
});
