var path = require('path');

var installBin = require('./installBin');
var installLib = require('./installLib');
var pathsExist = require('../pathsExist');

var PLATFORM_FILES = {
  win32: ['npm', 'npm.cmd'],
  posix: ['npm', 'npx'],
};

module.exports = function install(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  var paths = (PLATFORM_FILES[platform] || PLATFORM_FILES.posix).map(function (file) {
    return path.join(dest, file);
  });
  pathsExist(paths, function (err, exist) {
    if (err) return callback(err);
    if (exist) return callback(null, dest); // already installed

    installLib(version, dest, options, function (err) {
      if (err) return callback(err);
      installBin(version, dest, options, callback);
    });
  });
};
