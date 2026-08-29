import fs from 'fs';
import Module from 'module';
import path from 'path';
import Queue from 'queue-cb';
import conditionalCopy from '../../lib/conditionalCopy.ts';

import type { InstallOptions, NoParamCallback } from '../../types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export default function installWin32(buildPath: string, dest: string, _options: InstallOptions, callback: NoParamCallback): void {
  const buildSource = path.join(buildPath, 'out', 'Release', 'node.exe');
  const buildTarget = path.join(dest, 'node.exe');

  fs.stat(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer((cb) => {
      fs.stat(buildSource, (err: NodeJS.ErrnoException | null) => {
        if (!err) {
          callback();
          return;
        }
        // deferred: cross-spawn-cb is only needed when a build from source actually runs
        const spawnModule = _require('cross-spawn-cb');
        const spawn = spawnModule.default || spawnModule;
        spawn('./vcbuild', [], { stdio: 'inherit', cwd: buildPath }, (spawnErr: Error | null) => cb(spawnErr));
      });
    });
    queue.defer((cb) => conditionalCopy(buildSource, buildTarget, false, (err) => cb(err)));
    queue.await(callback);
  });
}
