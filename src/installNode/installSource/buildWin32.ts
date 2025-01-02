import path from 'path';
import spawn from 'cross-spawn-cb';
import Queue from 'queue-cb';

import access from 'fs-access-compat';
import conditionalCopy from '../../lib/conditionalCopy';

export default function installWin32(buildPath, dest, _options, callback) {
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
}
