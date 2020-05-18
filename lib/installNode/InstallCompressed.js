var path = require('path');
var fs = require('fs');
var download = require('get-remote');
var Queue = require('queue-cb');
var decompress = require('decompress');
var mkdirp = require('mkdirp');
var access = require('../access');
var progress = require('../progress');

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var cachePath = path.join(options.cacheDirectory, record.version, record.filename, path.basename(relativePath));

  fs.readdir(dest, function (err, names) {
    if (!err && names.length) return callback(); // already exists

    var queue = new Queue(1);
    queue.defer(function (callback) {
      access(cachePath, function (err) {
        if (!err) return callback(); // already exists
        mkdirp(path.dirname(cachePath), function () {
          download(options.downloadURL(relativePath), cachePath, { progress: progress }, callback);
        });
      });
    });
    queue.defer(function (callback) {
      fs.readFile(cachePath, function (err, contents) {
        if (err) return callback(err);
        mkdirp(dest, function () {
          decompress(contents, dest, { extract: true, strip: 1 }).then(callback.bind(null, null)).catch(callback);
        });
      });
    });
    queue.await(callback);
  });
};
