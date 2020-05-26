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
  buildDirectory: path.join(TMP_DIR, 'build'),
};
var VERSIONS = ['v12'];
var TARGETS = [{}];

function addTests(version, target) {
  var platform = target.platform || 'local';
  var arch = target.arch || 'local';

  it(version + ' (' + platform + ',' + arch + ')', function (done) {
    var installPath = path.join(INSTALLED_DIR, version + '-' + platform + '-' + arch);
    var args = [version, installPath, '--cacheDirectory', OPTIONS.cacheDirectory];
    if (platform !== 'local') args = args.concat(['--platform', platform]);
    if (arch !== 'local') args = args.concat(['--arch', arch]);

    crossSpawn(CLI, args, { stdio: 'inherit' }, function (err, res) {
      assert.ok(!err);
      assert.equal(res.code, 0);
      validateInstall(installPath, target);
      done();
    });
  });
}

describe('cli', function () {
  before(function (callback) {
    rimraf(INSTALLED_DIR, function () {
      rimraf(TMP_DIR, callback.bind(null, null));
    });
  });

  describe('happy path', function () {
    for (var i = 0; i < VERSIONS.length; i++) {
      for (var j = 0; j < TARGETS.length; j++) {
        addTests(VERSIONS[i], TARGETS[j]);
      }
    }
  });

  describe('unhappy path', function () {});
});
