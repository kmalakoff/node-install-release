import spawn from 'cross-spawn-cb';
import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';
import conditionalCopy from '../../lib/conditionalCopy.js';

export default function installWin32(buildPath, dest, _options, callback) {
  const buildSource = path.join(buildPath, 'out', 'Release', 'node.exe');
  const buildTarget = path.join(dest, 'node.exe');

  fs.stat(buildTarget, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(fs.stat.bind(null, buildSource, (err) => (!err ? callback() : spawn('./vcbuild', [], { stdio: 'inherit', cwd: buildPath }))));
    queue.defer(conditionalCopy.bind(null, buildSource, buildTarget, false));
    queue.await(callback);
  });
}
