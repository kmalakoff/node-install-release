var fs = require('fs');
var extract = require('fast-extract');
var mkpath = require('mkpath');
var assign = require('object-assign');

var progress = require('./progress');

module.exports = function conditionalExtract(src, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  fs.readdir(dest, function (err, names) {
    if (!err && names.length) return callback();

    mkpath(dest, function () {
      extract(src, dest, assign({ strip: 1, progress: progress, time: 1000 }, options), function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
