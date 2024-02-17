const path = require('path');
const spawn = require('cross-spawn-cb');
const Queue = require('queue-cb');

const access = require('fs-access-compat');
const conditionalCopy = require('../../conditionalCopy');

module.exports = function installWin32(buildPath, dest, _options, callback) {
  const buildSource = path.join(buildPath, 'out', 'Release', 'node.exe');
  const buildTarget = path.join(dest, 'node.exe');

  access(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer((callback) => {
      access(buildSource, (err) => {
        if (!err) return callback(); // already exists
        spawn('./vcbuild', [], { stdio: 'inherit', cwd: buildPath }, callback);
      });
    });
    queue.defer(conditionalCopy.bind(null, buildSource, buildTarget));
    queue.await(callback);
  });
};
