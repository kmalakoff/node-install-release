var path = require('path');
var fs = require('fs');

var installCompressed = require('../installCompressed');
var buildDefault = require('./buildDefault');
var buildWin32 = require('./buildWin32');

module.exports = function InstallSource(relativePath, dest, record, options, callback) {
  var buildPath = path.join(options.cacheDirectory, record.version, record.filename, 'build');
  var platform = options.platform || process.platform;

  fs.readdir(dest, function (err, names) {
    if (!err && names.length) return callback(); // already exists

    installCompressed(relativePath, buildPath, record, options, function (err) {
      if (err) return callback(err);
      platform === 'win32' ? buildWin32(buildPath, dest, options, callback) : buildDefault(buildPath, dest, options, callback);
    });
  });
};
