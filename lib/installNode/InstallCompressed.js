var path = require('path');
var fs = require('fs');
var download = require('get-remote');
var Queue = require('queue-cb');
var mkdirp = require('mkdirp');
var log = require('single-line-log').stdout;
var access = require('../access');
var progress = require('../progress');

var decompress = null;
function lazyDecompress() {
  if (!decompress) decompress = require('decompress');
  return decompress;
}

module.exports = function installCompressed(relativePath, dest, record, options, callback) {
  var cachePath = path.join(options.cacheDirectory, record.version, record.filename, path.basename(relativePath));

  fs.readdir(dest, function (err, names) {
    if (!err && names.length) return callback(); // already exists

    var queue = new Queue(1);
    queue.defer(function (callback) {
      access(cachePath, function (err) {
        if (!err) return callback(); // already exists
        mkdirp(path.dirname(cachePath), function () {
          download(options.downloadURL(relativePath), cachePath, { progress: progress }, function (err) {
            console.log('');
            callback(err);
          });
        });
      });
    });
    queue.defer(function (callback) {
      fs.readFile(cachePath, function (err, contents) {
        if (err) return callback(err);
        mkdirp(dest, function () {
          log('Decompressing ' + path.basename(cachePath));
          lazyDecompress()(contents, dest, { strip: 1 })
            .then(function () {
              log('Decompressing ' + path.basename(cachePath) + ' - done');
              console.log('');
              callback();
            })
            .catch(function (err) {
              log('Decompressing ' + path.basename(cachePath) + ' - error: ' + err.message);
              console.log('');
              callback(err);
            });
        });
      });
    });
    queue.await(callback);
  });
};
