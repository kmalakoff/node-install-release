const assert = require('assert');
const path = require('path');
const existsSync = require('fs-exists-sync');
const versionUtils = require('node-version-utils');
const cr = require('cr');
const isVersion = require('is-version');

const NODE = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE) ? 'node.exe' : 'node';

module.exports = function validateInstall(version, installPath, options, done) {
  options = options || {};
  const platform = options.platform || process.platform;

  if (platform === 'win32') {
    assert(existsSync(path.join(installPath, 'node.exe')), true);
    assert(existsSync(path.join(installPath, 'npm')), true);
    assert(existsSync(path.join(installPath, 'npm.cmd')), true);
    // existsSync(path.join(installPath, 'npx'));
    // existsSync(path.join(installPath, 'npx.cmd'));
    assert(existsSync(path.join(installPath, 'node_modules', 'npm')), true);
  } else {
    assert(existsSync(path.join(installPath, 'bin', 'node')), true);
    assert(existsSync(path.join(installPath, 'bin', 'npm')), true);
    // existsSync(path.join(installPath, 'bin', 'npx'));
    // existsSync(path.join(installPath, 'bin', 'node-waf'));
    assert(existsSync(path.join(installPath, 'lib', 'node_modules', 'npm')), true);
  }

  // if not the native platform, do not try running
  if (platform !== process.platform) return done();

  versionUtils.spawn(installPath, NODE, ['--version'], { encoding: 'utf8', env: {} }, (err, res) => {
    assert.ok(!err, err ? err.message : '');
    const lines = cr(res.stdout).split('\n');
    const spawnVersion = lines.slice(-2, -1)[0];
    assert.ok(isVersion(spawnVersion, 'v'));
    assert.ok(spawnVersion.indexOf(version) === 0);

    versionUtils.spawn(installPath, 'npm', ['--version'], { encoding: 'utf8' }, (err, res) => {
      assert.ok(!err, err ? err.message : '');
      const lines = cr(res.stdout).split('\n');
      const spawnVersionNPM = lines.slice(-2, -1)[0];
      assert.ok(isVersion(spawnVersionNPM));
      done();
    });
  });
};
