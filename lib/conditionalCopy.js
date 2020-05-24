var access = require('./access');
var copyFile = require('./copyFile');

module.exports = function conditionalCopy(src, dest, callback) {
  access(dest, function (err) {
    if (!err) return callback(); // already exists

    access(src, function (err) {
      if (err) return callback(); // only copy file if it exists
      copyFile(src, dest, callback);
    });
  });
}
