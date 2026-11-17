import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

import { NODE_DIST_BASE_URL, NODE_FILE_PATHS } from '../constants.ts';
import copyFile from '../lib/copyFile.ts';
import type { NoParamCallback, ResolvedInstallOptions } from '../types.ts';
import downloadValidated from './downloadValidated.ts';

export default function installExe(distPath: string, dest: string, options: ResolvedInstallOptions, callback: NoParamCallback): void {
  const platform = options.platform;
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  const cachePath = path.join(options.cachePath, `node-${distPath}.exe`);
  const nodePath = (NODE_FILE_PATHS as Record<string, string>)[platform as string] || NODE_FILE_PATHS.posix;
  const execPath = path.join(dest, nodePath);

  fs.stat(execPath, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer((cb) => downloadValidated(distPath, downloadPath, cachePath, options, (err) => cb(err)));
    queue.defer((cb) => copyFile(cachePath, execPath, (err) => cb(err)));
    queue.await(callback);
  });
}
