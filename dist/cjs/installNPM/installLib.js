"use strict";
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
    get(NODE_DIST_URL).json(function(err, res1) {
        if (err) return callback(err);
        var releases = res1.body;
        var found = releases.find(function(record) {
            return record.version === version.version;
        });
        var npmMajorPair = found && found.npm ? +found.npm.split('.')[0] : NPM_MIN_VERSION;
        var npmMajor = Math.max(npmMajorPair, NPM_MIN_VERSION);
        get(NPM_DIST_TAGS_URL).json(function(err, res2) {
            if (err) return callback(err);
            var distTags = res2.body;
            var installVersion = distTags["latest-".concat(npmMajor)] || distTags["next-".concat(npmMajor)] || distTags.latest;
            var downloadPath = "".concat(NPM_DIST_URL, "/-/npm-").concat(installVersion, ".tgz");
            var cachePath = path.join(options.cacheDirectory, path.basename(downloadPath));
            conditionalCache(downloadPath, cachePath, function(err) {
                if (err) return callback(err);
                conditionalExtract(cachePath, installPath, callback);
            });
        });
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }