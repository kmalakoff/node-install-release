var path = require('path');
var get = require('get-remote');

var conditionalCache = require('../conditionalCache');
var conditionalExtract = require('../conditionalExtract');

var NODE_DIST_URL = 'https://nodejs.org/dist/index.json';
var NPM_DIST_URL = 'https://registry.npmjs.org/npm';
var NPM_MIN_VERSION = '1.0.0';

module.exports = function installLib(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  var libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  var installPath = path.join(libPath, 'node_modules', 'npm');

  get(NODE_DIST_URL).json(function (err, res1) {
    if (err) return callback(err);
    var releases = res1.body;

    var found = releases.find(function (record) {
      return record.version === version.version;
    });
    var npm = (found ? found.npm : null) || NPM_MIN_VERSION;
    var maximumVersion = +npm.split('.')[0];

    get(NPM_DIST_URL).json(function (err, res2) {
      if (err) return callback(err);

      var installVersion = res2.body['dist-tags'][maximumVersion ? 'latest-' + maximumVersion : 'latest'];
      var downloadPath = NPM_DIST_URL + '/-/npm-' + installVersion + '.tgz';
      var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));
      conditionalCache(downloadPath, cachePath, function (err) {
        if (err) return callback(err);
        conditionalExtract(cachePath, installPath, callback);
      });
    });
  });
};
