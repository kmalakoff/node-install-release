"use strict";
var path = require('path');
var extract = require('fast-extract').default;
var mkpath = require('mkpath');
var access = require('fs-access-compat');
var progress = require('./progress');
module.exports = function conditionalExtract(src, dest, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    options = options || {};
    access(dest, function(err) {
        if (!err) return callback(); // already exists
        mkpath(path.dirname(dest), function() {
            var extractOptions = Object.assign({
                strip: 1,
                progress: progress,
                time: 1000
            }, options);
            extract(src, dest, extractOptions, function(err) {
                console.log('');
                callback(err);
            });
        });
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }