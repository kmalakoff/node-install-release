var path = require('path');

var conditionalCache = require('../conditionalCache');
var conditionalExtract = require('../conditionalExtract');
var findVersion = require('../findVersion');
var npmVersions = require('./npmVersions');

var DIST_URL = 'https://registry.npmjs.org/npm/-/npm-';

module.exports = function installLib(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  var downloadPath = DIST_URL + findVersion(npmVersions, version).bundled + '.tgz';
  var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));
  var libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  var installPath = path.join(libPath, 'node_modules', 'npm');

  conditionalCache(downloadPath, cachePath, function (err) {
    if (err) return callback(err);
    conditionalExtract(cachePath, installPath, callback);
  });
};
