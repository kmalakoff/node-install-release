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
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }