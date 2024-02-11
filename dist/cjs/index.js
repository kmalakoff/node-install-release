"use strict";
require("./polyfills");
var install = require("./install");
function installRelease(versionDetails, dest, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = null;
    }
    options = options || {};
    if (typeof callback === "function") return install(versionDetails, dest, options, callback);
    return new Promise(function(resolve, reject) {
        installRelease(versionDetails, dest, options, function installCallback(err, result) {
            err ? reject(err) : resolve(result);
        });
    });
}
module.exports = installRelease;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}