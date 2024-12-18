"use strict";
var find = require('lodash.find');
var endsWithFn = require('../endsWithFn');
var findDistPaths = require('./findDistPaths');
var installCompressed = require('./installCompressed');
var installExe = require('./installExe');
var installSource = require('./installSource');
module.exports = function install(version, dest, options, callback) {
    var record = findDistPaths(version, options);
    if (record) {
        if (record.filename === 'src') return installSource(record.relativePaths[0], dest, record, options, callback);
        var relativePath = find(record.relativePaths, endsWithFn([
            '.tar.gz',
            '.zip'
        ]));
        if (relativePath) return installCompressed(relativePath, dest, record, options, callback);
        relativePath = find(record.relativePaths, endsWithFn('.exe'));
        if (relativePath) return installExe(relativePath, dest, record, options, callback);
    }
    record = findDistPaths(version, {
        filename: 'src'
    });
    if (record && record.relativePaths.length) return installSource(record.relativePaths[0], dest, record, options, callback);
    callback(new Error("Unable to install ".concat(version)));
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }