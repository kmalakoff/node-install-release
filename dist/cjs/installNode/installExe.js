"use strict";
var path = require('path');
var access = require('fs-access-compat');
var conditionalCache = require('../conditionalCache');
var copyFile = require('../copyFile');
module.exports = function installExe(relativePath, dest, record, options, callback) {
    var downloadPath = options.downloadURL(relativePath);
    var cachePath = path.join(options.cacheDirectory, "node-".concat(record.version, ".exe"));
    var destPath = path.join(dest, path.basename(relativePath));
    access(destPath, function(err) {
        if (!err) return callback(); // already exists
        conditionalCache(downloadPath, cachePath, function(err) {
            if (err) return callback(err);
            copyFile(cachePath, destPath, callback);
        });
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }