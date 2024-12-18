"use strict";
var path = require('path');
var fs = require('fs');
var keys = require('lodash.keys');
var PLATFORM_FILES = {
    win32: {
        node: [
            'node.exe'
        ],
        npm: [
            'npm',
            'npm.cmd'
        ]
    },
    posix: {
        node: [
            'node'
        ],
        npm: [
            'npm'
        ]
    }
};
module.exports = function checkMissing(dest, options, callback) {
    var platform = options.platform || process.platform;
    var files = PLATFORM_FILES[platform] || PLATFORM_FILES.posix;
    var binPath = platform === 'win32' ? dest : path.join(dest, 'bin');
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
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }