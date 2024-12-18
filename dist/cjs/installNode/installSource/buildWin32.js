"use strict";
var path = require('path');
var spawn = require('cross-spawn-cb');
var Queue = require('queue-cb');
var access = require('fs-access-compat');
var conditionalCopy = require('../../conditionalCopy');
module.exports = function installWin32(buildPath, dest, _options, callback) {
    var buildSource = path.join(buildPath, 'out', 'Release', 'node.exe');
    var buildTarget = path.join(dest, 'node.exe');
    access(buildTarget, function(err) {
        if (!err) return callback(); // already exists
        var queue = new Queue(1);
        queue.defer(function(callback) {
            access(buildSource, function(err) {
                if (!err) return callback(); // already exists
                spawn('./vcbuild', [], {
                    stdio: 'inherit',
                    cwd: buildPath
                }, callback);
            });
        });
        queue.defer(conditionalCopy.bind(null, buildSource, buildTarget));
        queue.await(callback);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }