var toVersion = require('version-string-to-version');
var Queue = require('queue-cb');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

var access = require('./access');
var installNode = require('./installNode');
var installNPM = require('./installNPM');

module.exports = function install(versionString, dest, options, callback) {
  access(dest, function (err) {
    if (!err && !options.force) return callback();

    toVersion(versionString, function (err, version) {
      if (err) return callback(err);

      var queue = new Queue(1);
      !err || queue.defer(rimraf.bind(null, dest));
      queue.defer(mkdirp.bind(null, dest));
      queue.defer(function (callback) {
        installNode(version, dest, options, function (err, installed) {
          if (err || !installed) return callback(err || new Error('Failed to install ' + version));
          callback();
        });
      });
      queue.defer(installNPM.bind(null, version, dest, options));
      queue.await(callback);
    });
  });
};
