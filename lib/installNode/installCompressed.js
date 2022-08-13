var path = require('path');
var access = require('fs-access-compat');
var rimraf = require('rimraf');

var conditionalCache = require('../conditionalCache');
var conditionalExtract = require('../conditionalExtract');
var progress = require('../progress');

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var downloadPath = options.downloadURL(relativePath);
  var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));

  conditionalCache(downloadPath, cachePath, function (err) {
    if (err) return callback(err);
    access(dest, function (err) {
      if (!err) return callback(); // already exists
      conditionalExtract(cachePath, dest, Object.assign({ strip: 1, progress: progress, time: 1000 }, options), function (err) {
        console.log('');
        if (err) return callback(err);

        // some compressed versions of node come with npm pre-installed, but we want to override with a specific version
        var platform = options.platform || process.platform;
        var libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
        var installPath = path.join(libPath, 'node_modules', 'npm');
        rimraf(installPath, function () {
          callback(err);
        });
      });
    });
  });
};
