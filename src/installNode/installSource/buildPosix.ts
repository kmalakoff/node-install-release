import spawn from 'cross-spawn-cb';
import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

import type { InstallOptions, NoParamCallback } from '../../types.ts';

export default function installPosix(buildPath: string, dest: string, _options: InstallOptions, callback: NoParamCallback): void {
  const buildTarget = path.join(dest, 'node');

  fs.stat(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer((cb) => spawn('./configure', [`--prefix=${dest}`], { stdio: 'inherit', cwd: buildPath }, (err) => cb(err)));
    queue.defer((cb) => spawn('make', ['install'], { stdio: 'inherit', cwd: buildPath }, (err) => cb(err)));
    queue.await(callback);
  });
}
