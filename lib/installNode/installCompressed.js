var path = require('path');
var assign = require('object-assign');

var conditionalCache = require('../conditionalCache');
var conditionalExtract = require('../conditionalExtract');
var progress = require('../progress');

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var downloadPath = options.downloadURL(relativePath);
  var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));

  conditionalCache(downloadPath, cachePath, function (err) {
    if (err) return callback(err);
    conditionalExtract(cachePath, dest, assign({ strip: 1, progress: progress, time: 1000 }, options), function (err) {
      console.log('');
      callback(err);
    });
  });
};
