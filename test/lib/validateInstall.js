const assert = require('assert');
const path = require('path');
const accessSync = require('fs-access-sync-compat');
const versionUtils = require('node-version-utils');
const cr = require('cr');
const isVersion = require('is-version');

const NODE = process.platform === 'win32' ? 'node.exe' : 'node';

module.exports = function validateInstall(version, installPath, options, done) {
  options = options || {};
  const platform = options.platform || process.platform;

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

  versionUtils.spawn(installPath, NODE, ['--version'], { encoding: 'utf8', env: {} }, (err, res) => {
    assert.ok(!err);
    const lines = cr(res.stdout).split('\n');
    const spawnVersion = lines.slice(-2, -1)[0];
    assert.ok(isVersion(spawnVersion, 'v'));
    assert.ok(spawnVersion.indexOf(version) === 0);

    versionUtils.spawn(installPath, 'npm', ['--version'], { encoding: 'utf8' }, (err, res) => {
      const stdout = err ? err.stdout : res.stdout;
      const lines = cr(stdout).split('\n');
      const spawnVersionNPM = lines.slice(-2, -1)[0];
      assert.ok(isVersion(spawnVersionNPM));
      done();
    });
  });
};
