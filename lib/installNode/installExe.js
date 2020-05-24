var path = require('path');

var access = require('../access');
var conditionalCache = require('../conditionalCache');
var copyFile = require('../copyFile');

module.exports = function installExe(relativePath, dest, record, options, callback) {
  var downloadPath = options.downloadURL(relativePath);
  var cachePath = path.join(options.cacheDirectory, 'node', record.version, record.filename, path.basename(downloadPath));
  var destPath = path.join(dest, path.basename(relativePath));

  access(destPath, function (err) {
    if (!err) return callback(); // already exists
    conditionalCache(downloadPath, cachePath, function (err) {
      if (err) return callback(err);
      copyFile(cachePath, destPath, callback);
    });
  });
};
