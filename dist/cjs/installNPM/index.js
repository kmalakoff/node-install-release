"use strict";
var installBin = require("./installBin");
var installLib = require("./installLib");
module.exports = function install(version, dest, options, callback) {
    installLib(version, dest, options, function(err) {
        if (err) return callback(err);
        installBin(version, dest, options, callback);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }