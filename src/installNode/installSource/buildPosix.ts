import spawn from 'cross-spawn-cb';
import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

export default function installPosix(buildPath, dest, _options, callback) {
  const buildTarget = path.join(dest, 'node');

  fs.stat(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(spawn.bind(null, './configure', [`--prefix=${dest}`], { stdio: 'inherit', cwd: buildPath }));
    queue.defer(spawn.bind(null, 'make', ['install'], { stdio: 'inherit', cwd: buildPath }, callback));
    queue.await(callback);
  });
}
