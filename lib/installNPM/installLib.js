var path = require('path');
var download = require('get-remote');
var mkdirp = require('mkdirp');

var access = require('../access');

var DIST_URL = 'https://codeload.github.com/npm/cli/zip/';
var DEFAULT_VERSION = 'v1.4.28';

module.exports = function installLib(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  var libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  var installPath = path.join(libPath, 'node_modules', 'npm');

  access(installPath, function (err) {
    if (!err) return callback();

    mkdirp(installPath, function (err) {
      if (err) return callback(err);
      return download(DIST_URL + DEFAULT_VERSION, installPath, { extract: true, strip: 1 }, callback);
    });
  });
};
