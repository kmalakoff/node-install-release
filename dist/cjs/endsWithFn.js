"use strict";
var isArray = require("isarray");
var endsWith = require("end-with");
module.exports = function endsWithFn(endings) {
    if (!isArray(endings)) endings = [
        endings
    ];
    return function(string) {
        for(var index = 0; index < endings.length; index++){
            if (endsWith(string, endings[index])) return true;
        }
        return false;
    };
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }