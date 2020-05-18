var path = require('path');
var fs = require('fs');
var copyFile = require('fs-copy-file');
var download = require('get-remote');
var Queue = require('queue-cb');
var access = require('../access');
var progress = require('../progress');

module.exports = function installExe(relativePath, dest, record, options, callback) {
  var destPath = path.join(dest, path.basename(relativePath));
  var cachePath = path.join(options.cacheDirectory, record.version, record.filename, path.basename(relativePath));

  access(destPath, function (err) {
    if (!err) return callback(); // already exists

    var queue = new Queue(1);
    queue.defer(function (callback) {
      access(cachePath, function (err) {
        if (!err) return callback(); // already exists
        download(options.downloadURL(relativePath), cachePath, { progress: progress }, callback);
      });
    });
    queue.defer(copyFile.bind(null, cachePath, destPath));
    queue.await(callback);
  });
};
