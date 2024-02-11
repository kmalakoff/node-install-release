"use strict";
var log = require("single-line-log2").stdout;
module.exports = function progress(entry) {
    var message = "".concat(entry.progress, " ").concat(entry.basename);
    if (entry.percentage) message += " - ".concat(entry.percentage.toFixed(0), "%");
    log(message);
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}