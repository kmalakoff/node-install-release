"use strict";
var path = require('path');
var get = require('get-remote');
var access = require('fs-access-compat');
var progress = require('./progress');
var ensureDestinationParent = require('./ensureDestinationParent');
module.exports = function conditionalCache(endpoint, dest, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    options = options || {};
    access(dest, function(err) {
        if (!err) return callback(); // already exists
        ensureDestinationParent(dest, function(err) {
            if (err) return callback(err);
            // TODO: do I need assign?
            get(endpoint, Object.assign({
                filename: path.basename(dest),
                progress: progress,
                time: 1000
            }, options)).file(path.dirname(dest), function(err) {
                console.log('');
                callback(err);
            });
        });
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }