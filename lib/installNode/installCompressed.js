var path = require('path');
var mkpath = require('mkpath');
var extract = require('fast-extract');
var assign = require('object-assign');

var conditionalCache = require('../conditionalCache');
var progress = require('../progress');

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var downloadPath = options.downloadURL(relativePath);
  var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));

  conditionalCache(downloadPath, cachePath, function (err) {
    if (err) return callback(err);

    mkpath(dest, function () {
      extract(cachePath, dest, assign({ strip: 1, progress: progress, time: 1000 }, options), function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
