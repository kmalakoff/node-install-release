var path = require('path');

var conditionalCache = require('../conditionalCache');
var conditionalExtract = require('../conditionalExtract');

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var downloadPath = options.downloadURL(relativePath);
  var cachePath = path.join(options.cacheDirectory, 'node', record.version, record.filename, path.basename(downloadPath));

  conditionalCache(downloadPath, cachePath, function (err) {
    if (err) return callback(err);
    conditionalExtract(cachePath, dest, callback);
  });
};
