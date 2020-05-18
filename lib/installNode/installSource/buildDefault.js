var spawn = require('cross-spawn-cb');
var Queue = require('queue-cb');

module.exports = function installDefault(buildPath, dest, options, callback) {
  var queue = new Queue(1);
  queue.defer(function (callback) {
    spawn('./configure', ['--prefix=' + dest], { stdio: 'inherit', cwd: buildPath }, function (err, res) {
      if (err || res.code !== 0) return callback(err || new Error('Configure failed ' + buildPath));
      callback();
    });
  });
  queue.defer(function (callback) {
    spawn('make', ['install'], { stdio: 'inherit', cwd: buildPath }, function (err, res) {
      if (err || res.code !== 0) return callback(err || new Error('Build failed ' + buildPath));
      callback();
    });
  });
  queue.await(callback);
};
