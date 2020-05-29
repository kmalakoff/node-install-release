var installBin = require('./installBin');
var installLib = require('./installLib');
var everyBinAccess = require('../everyBinAccess');

var PLATFORM_FILES = {
  win32: ['npm', 'npm.cmd'],
  posix: ['npm'],
};

module.exports = function install(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  everyBinAccess(PLATFORM_FILES[platform] || PLATFORM_FILES.posix, dest, options, function (err) {
    if (!err) return callback(); // already installed

    installLib(version, dest, options, function (err) {
      if (err) return callback(err);
      installBin(version, dest, options, callback);
    });
  });
};
