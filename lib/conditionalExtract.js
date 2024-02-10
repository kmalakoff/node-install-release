var path = require('path');
var extract = require('fast-extract');
var mkpath = require('mkpath');
var access = require('fs-access-compat');

var progress = require('./progress');

module.exports = function conditionalExtract(src, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    mkpath(path.dirname(dest), () => {
      var extractOptions = Object.assign({ strip: 1, progress: progress, time: 1000 }, options);

      extract(src, dest, extractOptions, (err) => {
        console.log('');
        callback(err);
      });
    });
  });
};
