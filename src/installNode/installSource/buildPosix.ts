import fs from 'fs';
import Module from 'module';
import path from 'path';
import Queue from 'queue-cb';

import type { InstallOptions, NoParamCallback } from '../../types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export default function installPosix(buildPath: string, dest: string, _options: InstallOptions, callback: NoParamCallback): void {
  const buildTarget = path.join(dest, 'node');

  fs.stat(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    // deferred: cross-spawn-cb is only needed when a build from source actually runs
    const spawnModule = _require('cross-spawn-cb');
    const spawn = spawnModule.default || spawnModule;
    const queue = new Queue(1);
    queue.defer((cb) => spawn('./configure', [`--prefix=${dest}`], { stdio: 'inherit', cwd: buildPath }, (err: Error | null) => cb(err)));
    queue.defer((cb) => spawn('make', ['install'], { stdio: 'inherit', cwd: buildPath }, (err: Error | null) => cb(err)));
    queue.await(callback);
  });
}
