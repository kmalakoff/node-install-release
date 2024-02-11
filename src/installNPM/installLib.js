var path = require('path');
var get = require('get-remote');

var conditionalCache = require('../conditionalCache');
var conditionalExtract = require('../conditionalExtract');

var NODE_DIST_URL = 'https://nodejs.org/dist/index.json';
var NPM_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/npm/dist-tags';
var NPM_DIST_URL = 'https://registry.npmjs.org/npm';
var NPM_MIN_VERSION = 3;

module.exports = function installLib(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  var libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  var installPath = path.join(libPath, 'node_modules', 'npm');

  get(NODE_DIST_URL).json((err, res1) => {
    if (err) return callback(err);
    var releases = res1.body;

    var found = releases.find((record) => record.version === version.version);
    var npmMajorPair = found?.npm ? +found.npm.split('.')[0] : NPM_MIN_VERSION;
    var npmMajor = Math.max(npmMajorPair, NPM_MIN_VERSION);

    get(NPM_DIST_TAGS_URL).json((err, res2) => {
      if (err) return callback(err);
      var distTags = res2.body;
      var installVersion = distTags[`latest-${npmMajor}`] || distTags[`next-${npmMajor}`] || distTags.latest;
      var downloadPath = `${NPM_DIST_URL}/-/npm-${installVersion}.tgz`;
      var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));
      conditionalCache(downloadPath, cachePath, (err) => {
        if (err) return callback(err);
        conditionalExtract(cachePath, installPath, callback);
      });
    });
  });
};
