"use strict";
var cp = require("child_process");
module.exports = function execCallback(cmd, options, callback) {
    return cp.exec(cmd, options, callback);
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}