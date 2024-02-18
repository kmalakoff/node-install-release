"use strict";
var cp = require("child_process");
module.exports = function execCallback(cmd, options, callback) {
    return cp.exec(cmd, options, callback);
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }