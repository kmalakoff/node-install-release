var toVersion = require('version-string-to-version');
var Queue = require('queue-cb');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

var access = require('./access');
var prebuiltInstall = require('./prebuilt/install');
var sourceInstall = require('./source/install');

module.exports = function install(versionString, dest, options, callback) {
  // do not overwrite destination
  access(dest, function (err) {
    if (!err && !options.force) return callback();

    var queue = new Queue(1);
    !err || queue.defer(rimraf.bind(null, dest));
    queue.defer(mkdirp.bind(null, dest));
    queue.defer(function (callback) {
      toVersion(versionString, function (err, version) {
        if (err) return callback(err);

        prebuiltInstall(version, dest, options, function (err, installed) {
          if (err) return callback(err);
          if (installed) return callback(null, installed);
          sourceInstall(version, dest, options, callback);
        });
      });
    });
    queue.await(callback);
  });
};
