var path = require('path');
var download = require('get-remote');
var mkpath = require('mkpath');
var assign = require('object-assign');

var progress = require('./progress');
var access = require('fs-access-compat');

module.exports = function conditionalCache(endpoint, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, function (err) {
    if (!err) return callback(); // already exists

    mkpath(path.dirname(dest), function () {
      download(endpoint, path.dirname(dest), assign({ filename: path.basename(dest), progress: progress, time: 1000 }, options), function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
