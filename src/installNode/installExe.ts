import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

import { NODE_DIST_BASE_URL, NODE_FILE_PATHS } from '../constants.ts';
import conditionalCache from '../lib/conditionalCache.ts';
import copyFile from '../lib/copyFile.ts';
import type { InstallOptions, NoParamCallback } from '../types.ts';
import validateDownload from './validateDownload.ts';

export default function installExe(distPath: string, dest: string, options: InstallOptions, callback: NoParamCallback): void {
  const platform = options.platform;
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  const cachePath = path.join(options.cachePath!, `node-${distPath}.exe`);
  const nodePath = (NODE_FILE_PATHS as Record<string, string>)[platform as string] || NODE_FILE_PATHS.posix;
  const execPath = path.join(dest, nodePath);

  fs.stat(execPath, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer((cb) => conditionalCache(downloadPath, cachePath, options, (err) => cb(err)));
    queue.defer((cb) => validateDownload(distPath, cachePath, (err) => cb(err)));
    queue.defer((cb) => copyFile(cachePath, execPath, (err) => cb(err)));
    queue.await(callback);
  });
}
