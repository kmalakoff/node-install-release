"use strict";
var log = require("single-line-log2").stdout;
module.exports = function progress(entry) {
    var message = "".concat(entry.progress, " ").concat(entry.basename);
    if (entry.percentage) message += " - ".concat(entry.percentage.toFixed(0), "%");
    log(message);
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }