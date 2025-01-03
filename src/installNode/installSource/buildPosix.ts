import path from 'path';
import spawn from 'cross-spawn-cb';
import access from 'fs-access-compat';
import Queue from 'queue-cb';

export default function installPosix(buildPath, dest, _options, callback) {
  const buildTarget = path.join(dest, 'node');

  access(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(spawn.bind(null, './configure', [`--prefix=${dest}`], { stdio: 'inherit', cwd: buildPath }));
    queue.defer(spawn.bind(null, 'make', ['install'], { stdio: 'inherit', cwd: buildPath }, callback));
    queue.await(callback);
  });
}
