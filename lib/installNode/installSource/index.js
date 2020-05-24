var path = require('path');

var installCompressed = require('../installCompressed');
var buildDefault = require('./buildDefault');
var buildWin32 = require('./buildWin32');

module.exports = function InstallSource(relativePath, dest, record, options, callback) {
  var buildPath = path.join(options.cacheDirectory, 'src', record.filename);
  var platform = options.platform || process.platform;

  installCompressed(relativePath, buildPath, record, options, function (err) {
    if (err) return callback(err);
    platform === 'win32' ? buildWin32(buildPath, dest, options, callback) : buildDefault(buildPath, dest, options, callback);
  });
};
