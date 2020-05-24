var path = require('path');

var conditionalCache = require('../conditionalCache');
var conditionalExtract = require('../conditionalExtract');

var PLATFORM_FILES = {
  win32: ['node.exe'],
  default: ['node'],
};

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var downloadPath = options.downloadURL(relativePath);
  var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));
  var platform = options.platform || process.platform;
  var files = PLATFORM_FILES[platform] || PLATFORM_FILES.default;

  conditionalCache(downloadPath, cachePath, function (err) {
    if (err) return callback(err);
    conditionalExtract(cachePath, dest, { strip: 1, files: files }, callback);
  });
};
