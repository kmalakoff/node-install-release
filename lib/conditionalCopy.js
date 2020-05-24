var access = require('./access');
var copyFile = require('./copyFile');

module.exports = function conditionalCopy(src, dest, optional, callback) {
  if (typeof optional === 'function') {
    callback = optional;
    optional = false;
  }

  access(dest, function (err) {
    if (!err) return callback(); // already exists
    if (!optional) copyFile(src, dest, callback);

    access(src, function (err) {
      if (err) return callback(); // file missing
      copyFile(src, dest, callback);
    });
  });
};
