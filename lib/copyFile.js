var path = require('path');
var fs = require('fs');
var mkpath = require('mkpath');
var rimraf = require('rimraf');
var pump = require('pump');
var Queue = require('queue-cb');

function streamCopyFile(src, dest, callback) {
  fs.stat(src, function (err) {
    if (err) return callback(err);
    pump(fs.createReadStream(src), fs.createWriteStream(dest), callback);
  });
}

var copyFile = fs.copyFile || streamCopyFile;

module.exports = function safeCopyFile(src, dest, callback) {
  var queue = new Queue(1);

  queue.defer(function (callback) {
    mkpath(path.dirname(dest), callback.bind(null, null));
  });
  queue.defer(function (callback) {
    rimraf(dest, function (err) {
      err && err.code !== 'EEXIST' ? callback(err) : callback();
    });
  });
  queue.defer(copyFile.bind(null, src, dest));
  queue.await(callback);
};
