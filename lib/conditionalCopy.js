var path = require('path');
var mkdirp = require('mkdirp');

var access = require('./access');
var copyFile = require('./copyFile');

module.exports = function conditionalCopy(src, dest, optional, callback) {
  if (typeof optional === 'function') {
    callback = optional;
    optional = false;
  }

  access(dest, function (err) {
    if (!err) return callback(); // already exists

    mkdirp(path.dirname(dest), function () {
      if (!optional) copyFile(src, dest, callback);

      access(src, function (err) {
        if (err) return callback(); // optional file missing
        copyFile(src, dest, callback);
      });
    });
  });
};
