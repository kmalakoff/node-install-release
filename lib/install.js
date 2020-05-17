var toVersion = require('version-string-to-version');
var Queue = require('queue-cb');
var mkdirp = require('mkdirp');

var installNode = require('./installNode');
var installNPM = require('./installNPM');

module.exports = function install(versionString, dest, options, callback) {
  toVersion(versionString, function (err, version) {
    if (err) return callback(err);

    var queue = new Queue(1);
    queue.defer(function (callback) {
      mkdirp(dest, callback.bind(null, null));
    });
    queue.defer(function (callback) {
      installNode(version, dest, options, function (err, installed) {
        if (err || !installed) return callback(err || new Error('Failed to install ' + version));
        callback();
      });
    });
    queue.defer(installNPM.bind(null, version, dest, options));
    queue.await(callback);
  });
};
