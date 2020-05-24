var fs = require('fs');
var path = require('path');
var extract = require('fast-extract');
var mkdirp = require('mkdirp');

var progress = require('./progress');

module.exports = function conditionalExtract(src, dest, callback) {
  fs.readdir(dest, function (err, names) {
    if (!err && names.length) return callback(); // already exists

    mkdirp(path.dirname(dest), function () {
      extract(src, dest, { progress: progress, time: 1000, strip: 1 }, function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
