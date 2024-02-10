var path = require('path');
var spawn = require('cross-spawn-cb');
var Queue = require('queue-cb');
var access = require('fs-access-compat');

module.exports = function installDefault(buildPath, dest, _options, callback) {
  var buildTarget = path.join(dest, 'node');

  access(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    var queue = new Queue(1);
    queue.defer((callback) => {
      spawn('./configure', [`--prefix=${dest}`], { stdio: 'inherit', cwd: buildPath }, callback);
    });
    queue.defer((callback) => {
      spawn('make', ['install'], { stdio: 'inherit', cwd: buildPath }, callback);
    });
    queue.await(callback);
  });
};
