var fs = require('fs');
var path = require('path');
var extract = require('fast-extract');
var mkpath = require('mkpath');
var assign = require('object-assign');
var intersection = require('lodash.intersection');

var progress = require('./progress');

module.exports = function conditionalExtract(src, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  fs.readdir(dest, function (err, files) {
    if (!err) {
      var expectedFiles = options.files || [];
      if (intersection(files, expectedFiles).length === expectedFiles.length) return callback(); // already exists
    }

    mkpath(dest, function () {
      extract(src, dest, assign({ strip: 1, progress: progress, time: 1000 }, options), function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
