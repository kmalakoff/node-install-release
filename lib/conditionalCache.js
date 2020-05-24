var fs = require('fs');
var path = require('path');
var download = require('get-remote');
var mkdirp = require('mkdirp');

var progress = require('./progress');

module.exports = function conditionalCache(src, dest, callback) {
  fs.readdir(dest, function (err, names) {
    if (!err && names.length) return callback(); // already exists

    mkdirp(path.dirname(dest), function () {
      download(src, path.dirname(dest), { progress: progress, time: 1000 }, function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
