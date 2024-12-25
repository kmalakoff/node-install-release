const path = require('path');
const extract = require('fast-extract').default;
const mkdirp = require('mkdirp-classic');
const access = require('fs-access-compat');

const progress = require('./progress');

module.exports = function conditionalExtract(src, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    mkdirp(path.dirname(dest), () => {
      extract(src, dest, { strip: 1, progress: progress, time: 1000, ...options }, (err) => {
        console.log('');
        callback(err);
      });
    });
  });
};
