"use strict";
var path = require("path");
var Queue = require("queue-cb");
var installNode = require("./installNode");
var installNPM = require("./installNPM");
var checkMissing = require("./checkMissing");
var ensureDestinationParent = require("./ensureDestinationParent");
module.exports = function install(version, dest, options, callback) {
    // use cwd if dest not provided
    if (!dest) dest = path.join(process.cwd(), version.version);
    checkMissing(dest, options, function(err, missing) {
        if (err || !missing.length) return callback(err, dest);
        var queue = new Queue(1);
        queue.defer(ensureDestinationParent.bind(null, dest));
        !~missing.indexOf("node") || queue.defer(installNode.bind(null, version, dest, options));
        !~missing.indexOf("npm") || queue.defer(installNPM.bind(null, version, dest, options));
        queue.await(function(err) {
            err ? callback(err) : callback(null, dest);
        });
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}