var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var crossSpawn = require('cross-spawn-cb');

var validateInstall = require('../lib/validateInstall');

var CLI = path.join(__dirname, '..', '..', 'bin', 'node-install-release.js');
var TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
var INSTALLED_DIR = path.join(TMP_DIR, 'installed');
var OPTIONS = {
  cacheDirectory: path.join(TMP_DIR, 'cache'),
  buildDirectory: path.join(TMP_DIR, 'build'),
};
var VERSIONS = ['v12'];
var TARGETS = [{}];

function addTests(version, target) {
  var platform = target.platform || 'local';
  var arch = target.arch || 'local';

  it(`${version} (${platform},${arch})`, (done) => {
    var installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
    var args = [version, installPath, '--cacheDirectory', OPTIONS.cacheDirectory, '--silent'];
    if (platform !== 'local') args = args.concat(['--platform', platform]);
    if (arch !== 'local') args = args.concat(['--arch', arch]);

    crossSpawn(CLI, args, { stdio: 'inherit' }, (err, _res) => {
      assert.ok(!err);
      validateInstall(version, installPath, target, done);
    });
  });
}

describe('cli', () => {
  before((callback) => {
    rimraf(INSTALLED_DIR, () => {
      rimraf(TMP_DIR, callback.bind(null, null));
    });
  });

  describe('happy path', () => {
    for (var i = 0; i < VERSIONS.length; i++) {
      for (var j = 0; j < TARGETS.length; j++) {
        addTests(VERSIONS[i], TARGETS[j]);
      }
    }
  });

  describe('unhappy path', () => {});
});
