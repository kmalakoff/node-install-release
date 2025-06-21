import spawn from 'cross-spawn-cb';
import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

import type { InstallOptions, NoParamCallback } from '../../types.ts';

export default function installPosix(buildPath: string, dest: string, _options: InstallOptions, callback: NoParamCallback): undefined {
  const buildTarget = path.join(dest, 'node');

  fs.stat(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(spawn.bind(null, './configure', [`--prefix=${dest}`], { stdio: 'inherit', cwd: buildPath }));
    queue.defer(spawn.bind(null, 'make', ['install'], { stdio: 'inherit', cwd: buildPath }, callback));
    queue.await(callback);
  });
}
