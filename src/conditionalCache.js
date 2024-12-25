const path = require('path');
const get = require('get-remote');
const access = require('fs-access-compat');

const progress = require('./progress');
const ensureDestinationParent = require('./ensureDestinationParent');

module.exports = function conditionalCache(endpoint, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    ensureDestinationParent(dest, (err) => {
      if (err) return callback(err);

      get(endpoint, { filename: path.basename(dest), progress: progress, time: 1000, ...options }).file(path.dirname(dest), (err) => {
        console.log('');
        callback(err);
      });
    });
  });
};
