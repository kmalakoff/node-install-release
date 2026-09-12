var path = require('path');
var extract = require('fast-extract');
var mkpath = require('mkpath');
var assign = require('object-assign');
var access = require('fs-access-compat');

var progress = require('./progress');

module.exports = function conditionalExtract(src, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, function (err) {
    if (!err) return callback(); // already exists

    mkpath(path.dirname(dest), function () {
      extract(src, dest, assign({ strip: 1, progress: progress, time: 1000 }, options), function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
