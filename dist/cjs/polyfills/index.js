"use strict";
require("core-js/actual/object/assign");
require("core-js/actual/promise");
var cp = require("child_process");
if (!cp.execSync) {
    var path = require("path");
    var execCallback = path.join(__dirname, "execCallback.js");
    var functionExec = null; // break dependencies
    cp.execSync = function execSyncPolyfill(cmd, options) {
        if (!functionExec) functionExec = require("function-exec-sync");
        return functionExec({
            callbacks: true
        }, execCallback, cmd, options || {});
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}