"use strict";
var distPaths = require('node-filename-to-dist-paths');
var prebuiltFilenames = require('./filenames');
module.exports = function findDistPaths(version, options) {
    var filenames = options.filename ? [
        options.filename
    ] : prebuiltFilenames(options);
    for(var index = 0; index < filenames.length; index++){
        var filename = filenames[index];
        if (!~version.files.indexOf(filename)) continue;
        var relativePaths = distPaths(filename, version.version);
        if (relativePaths && relativePaths.length) return {
            version: version.version,
            filename: filename,
            relativePaths: relativePaths
        };
    }
    return null;
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }