var path = require('path');

var installCompressed = require('../installCompressed');
var buildPosix = require('./buildPosix');
var buildWin32 = require('./buildWin32');

module.exports = function InstallSource(relativePath, dest, record, options, callback) {
  var platform = options.platform || process.platform;
  var build = platform === 'win32' ? buildWin32 : buildPosix;
  var buildPath = path.join(options.buildDirectory, path.basename(relativePath));

  installCompressed(relativePath, buildPath, record, options, function (err) {
    if (err) return callback(err);
    build(buildPath, dest, options, callback);
  });
};
