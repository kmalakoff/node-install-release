var path = require('path');
var Queue = require('queue-cb');
var mkpath = require('mkpath');

var installNode = require('./installNode');
var installNPM = require('./installNPM');
var checkMissing = require('./checkMissing');

module.exports = function install(version, dest, options, callback) {
  // use cwd if dest not provided
  if (!dest) dest = path.join(process.cwd(), version.version);

  checkMissing(dest, options, function (err, missing) {
    if (err || !missing.length) return callback(err, dest);

    var queue = new Queue(1);
    queue.defer(function (callback) {
      mkpath(dest, callback.bind(null, null));
    });
    !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, dest, options));
    !~missing.indexOf('npm') || queue.defer(installNPM.bind(null, version, dest, options));
    queue.await(function (err) {
      err ? callback(err) : callback(null, dest);
    });
  });
};
