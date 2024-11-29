"use strict";
var cp = require('child_process');
module.exports = function execCallback(cmd, options, callback) {
    return cp.exec(cmd, options, callback);
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }