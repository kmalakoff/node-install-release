"use strict";
var path = require("path");
var fs = require("fs");
var keys = require("lodash.keys");
var PLATFORM_FILES = {
    win32: {
        node: [
            "node.exe"
        ],
        npm: [
            "npm",
            "npm.cmd"
        ]
    },
    posix: {
        node: [
            "node"
        ],
        npm: [
            "npm"
        ]
    }
};
module.exports = function checkMissing(dest, options, callback) {
    var platform = options.platform || process.platform;
    var files = PLATFORM_FILES[platform] || PLATFORM_FILES.posix;
    var binPath = platform === "win32" ? dest : path.join(dest, "bin");
    fs.readdir(binPath, function(err, names) {
        if (err || !names.length) return callback(null, keys(files));
        var missing = [];
        for(var key in files){
            var needed = files[key];
            for(var index = 0; index < needed.length; index++){
                if (!~names.indexOf(needed[index])) {
                    missing.push(key);
                    break;
                }
            }
        }
        return callback(null, missing);
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}