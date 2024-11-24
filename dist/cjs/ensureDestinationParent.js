"use strict";
var path = require('path');
var mkpath = require('mkpath');
module.exports = function ensureDestinationParent(dest, callback) {
    var parent = path.dirname(dest);
    if (parent === '.' || parent === '/') return callback();
    mkpath(parent, function(err) {
        callback(err);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }