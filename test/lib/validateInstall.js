var assert = require('assert');
var path = require('path');
var accessSync = require('fs-access-sync-compat');
var versionUtils = require('node-version-utils');
var cr = require('cr');
var isVersion = require('is-version');

var NODE = process.platform === 'win32' ? 'node.exe' : 'node';

module.exports = function validateInstall(version, installPath, options, done) {
  options = options || {};
  var platform = options.platform || process.platform;

  if (platform === 'win32') {
    try {
      accessSync(path.join(installPath, 'node.exe'));
      accessSync(path.join(installPath, 'npm'));
      accessSync(path.join(installPath, 'npm.cmd'));
      // accessSync(path.join(installPath, 'npx'));
      // accessSync(path.join(installPath, 'npx.cmd'));
      accessSync(path.join(installPath, 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
      return done(err);
    }
  } else {
    try {
      accessSync(path.join(installPath, 'bin', 'node'));
      accessSync(path.join(installPath, 'bin', 'npm'));
      // accessSync(path.join(installPath, 'bin', 'npx'));
      // accessSync(path.join(installPath, 'bin', 'node-waf'));
      accessSync(path.join(installPath, 'lib', 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
      return done(err);
    }
  }

  // if not the native platform, do not try running
  if (platform !== process.platform) return done();

  versionUtils.spawn(installPath, NODE, ['--version'], { encoding: 'utf8' }, function (err, res) {
    assert.ok(!err);
    var lines = cr(res.stdout).split('\n');
    assert.ok(isVersion(lines.slice(-2, -1)[0], 'v'));
    assert.ok(lines.slice(-2, -1)[0].indexOf(version) === 0);

    versionUtils.spawn(installPath, 'npm', ['--version'], { encoding: 'utf8' }, function (err, res) {
      assert.ok(!err);
      var lines = cr(res.stdout).split('\n');
      assert.ok(isVersion(lines.slice(-2, -1)[0]));
      done();
    });
  });
};
