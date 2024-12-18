"use strict";
require('core-js/actual/object/assign');
require('core-js/actual/promise');
var cp = require('child_process');
if (!cp.execSync) {
    var path = require('path');
    var execCallback = path.join(__dirname, 'execCallback.js');
    var functionExec = null; // break dependencies
    cp.execSync = function execSyncPolyfill(cmd, options) {
        if (!functionExec) functionExec = require('function-exec-sync');
        return functionExec({
            callbacks: true
        }, execCallback, cmd, options || {});
    };
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }