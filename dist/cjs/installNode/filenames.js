"use strict";
var osArch = require('os').arch || require('../arch');
var PLATFORM_OS = {
    win32: 'win',
    darwin: 'osx'
};
var PLATFORM_FILES = {
    win32: [
        'zip',
        'exe'
    ],
    darwin: [
        'tar'
    ]
};
module.exports = function prebuiltFilenames(options) {
    var platform = options.platform || process.platform;
    var os = PLATFORM_OS[platform] || platform;
    var archs = [
        options.arch || osArch()
    ];
    if (platform === 'darwin' && archs[0] === 'arm64') archs.push('x64'); // fallback
    var files = PLATFORM_FILES[platform];
    var results = [];
    for(var i = 0; i < archs.length; i++){
        if (typeof files === 'undefined') {
            results.push("".concat(os, "-").concat(archs[i]));
        } else {
            for(var j = 0; j < files.length; j++){
                results.push("".concat(os, "-").concat(archs[i], "-").concat(files[j]));
            }
        }
    }
    return results;
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }