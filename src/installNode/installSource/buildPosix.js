const path = require('path');
const spawn = require('cross-spawn-cb');
const Queue = require('queue-cb');
const access = require('fs-access-compat');

module.exports = function installDefault(buildPath, dest, _options, callback) {
  const buildTarget = path.join(dest, 'node');

  access(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer((callback) => {
      spawn('./configure', [`--prefix=${dest}`], { stdio: 'inherit', cwd: buildPath }, callback);
    });
    queue.defer((callback) => {
      spawn('make', ['install'], { stdio: 'inherit', cwd: buildPath }, callback);
    });
    queue.await(callback);
  });
};
