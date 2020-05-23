var path = require('path');
var download = require('get-remote');
var mkdirp = require('mkdirp-classic');

var access = require('../access');
var progress = require('../progress');
var findVersion = require('../findVersion');
var npmVersions = require('./npmVersions');

var DIST_URL = 'https://codeload.github.com/npm/cli/zip/';

module.exports = function installLib(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  var libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  var installPath = path.join(libPath, 'node_modules', 'npm');
  var bundledVersion = findVersion(npmVersions, version).bundled;

  access(installPath, function (err) {
    if (!err) return callback();

    mkdirp(installPath, function (err) {
      if (err) return callback(err);
      return download(DIST_URL + bundledVersion, installPath, { extract: true, strip: 1, progress: progress, time: 1000 }, function (err) {
        console.log('');
        callback(err);
      });
    });
  });
};
