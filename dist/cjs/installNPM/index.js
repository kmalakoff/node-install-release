"use strict";
var installBin = require("./installBin");
var installLib = require("./installLib");
module.exports = function install(version, dest, options, callback) {
    installLib(version, dest, options, function(err) {
        if (err) return callback(err);
        installBin(version, dest, options, callback);
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}