var path = require('path');
var access = require('./access');

module.exports = function everyBinAccess(paths, dest, options, callback) {
  var fn = access;

  var platform = options.platform || process.platform;
  var binPath = platform === 'win32' ? dest : path.join(dest, 'bin');
  var values = paths.map(function (file) {
    return path.join(binPath, file);
  });

  var index = -1;
  function next(err) {
    if (err || ++index >= values.length) return callback(err);
    fn(values[index], next);
  }
  next();
};
