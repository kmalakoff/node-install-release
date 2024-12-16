"use strict";
var fs = require('fs');
var rimraf2 = require('rimraf2');
var pump = require('pump');
var Queue = require('queue-cb');
var ensureDestinationParent = require('./ensureDestinationParent');
function streamCopyFile(src, dest, callback) {
    fs.stat(src, function(err) {
        if (err) return callback(err);
        pump(fs.createReadStream(src), fs.createWriteStream(dest), callback);
    });
}
var copyFile = fs.copyFile || streamCopyFile;
module.exports = function safeCopyFile(src, dest, callback) {
    var queue = new Queue(1);
    queue.defer(ensureDestinationParent.bind(null, dest));
    queue.defer(function(callback) {
        rimraf2(dest, {
            disableGlob: true
        }, function(err) {
            err && err.code !== 'EEXIST' ? callback(err) : callback();
        });
    });
    queue.defer(copyFile.bind(null, src, dest));
    queue.await(callback);
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }