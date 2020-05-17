var path = require('path');
var fs = require('fs');
var distPaths = require('node-filename-to-dist-paths');
var spawn = require('cross-spawn-cb');
var crypto = require('crypto');
var download = require('get-remote');
var Queue = require('queue-cb');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

var TMP_DIR = path.join(require('osenv').home(), '.tmp');
var DIST_URL = 'https://nodejs.org/dist/';

module.exports = function installSource(version, dest, options, callback) {
  var relativePaths = distPaths('src', version);
  if (!relativePaths.length) return callback(new Error('Source distrubtion paths not found'));

  var platform = options.platform || process.platform;
  var binPath = platform === 'win32' ? dest : path.join(dest, 'bin');

  var tmpBasename = crypto
    .createHash('md5')
    .update(version)
    .update('' + new Date().valueOf())
    .digest('hex')
    .slice(0, 16);
  tmpBasename = '26f47d8f9be8818c';
  var tmpPath = path.join(TMP_DIR, tmpBasename);

  var queue = new Queue(1);
  queue.defer(function (callback) {
    mkdirp(TMP_DIR, callback.bind(null, null));
  });
  queue.defer(function (callback) {
    mkdirp(binPath, callback.bind(null, null));
  });
  // queue.defer(download.bind(null, DIST_URL + relativePaths[0], tmpPath, { extract: true, strip: 1 }));
  // queue.defer(function (callback) {
  //   spawn('./configure', [], { stdio: 'inherit', cwd: tmpPath }, function (err, res) {
  //     if (err || res.code !== 0) return callback(err || new Error('Configure failed ' + tmpPath));
  //     callback();
  //   });
  // });
  // queue.defer(function (callback) {
  //   spawn('make', ['install'], { stdio: 'inherit', cwd: tmpPath }, function (err, res) {
  //     if (err || res.code !== 0) return callback(err || new Error('Configure failed ' + tmpPath));
  //     callback();
  //   });
  // });
  queue.defer(fs.copyFile.bind(null, path.join(tmpPath, 'out', 'Release', 'node'), path.join(binPath, 'node')));
  queue.await(function (err) {
    // rimraf(tmpPath, function () {
    err ? callback(err) : callback(null, true);
    // });
  });
};
