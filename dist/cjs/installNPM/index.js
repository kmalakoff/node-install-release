"use strict";
var installBin = require('./installBin');
var installLib = require('./installLib');
module.exports = function install(version, dest, options, callback) {
    installLib(version, dest, options, function(err) {
        if (err) return callback(err);
        installBin(version, dest, options, callback);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }