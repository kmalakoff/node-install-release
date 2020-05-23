var path = require('path');
var fs = require('fs');
var download = require('get-remote');
var extract = require('fast-extract');
var Queue = require('queue-cb');
var mkdirp = require('mkdirp-classic');

var access = require('../access');
var progress = require('../progress');

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var downloadPath = options.downloadURL(relativePath);
  var cachePath = path.join(options.cacheDirectory, record.version, record.filename, path.basename(downloadPath));

  fs.readdir(dest, function (err, names) {
    if (!err && names.length) return callback(); // already exists

    var queue = new Queue(1);
    queue.defer(function (callback) {
      access(cachePath, function (err) {
        if (!err) return callback(); // already exists
        mkdirp(path.dirname(cachePath), function () {
          download(downloadPath, path.dirname(cachePath), { progress: progress, time: 1000 }, function (err) {
            console.log('');
            callback(err);
          });
        });
      });
    });
    queue.defer(function (callback) {
      extract(cachePath, dest, { progress: progress, time: 1000, strip: 1 }, function (err) {
        console.log('');
        callback(err);
      });
    });
    queue.await(callback);
  });
};
