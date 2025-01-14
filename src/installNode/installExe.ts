import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

import { NODE_DIST_BASE_URL, NODE_FILE_PATHS } from '../constants';
import conditionalCache from '../lib/conditionalCache';
import copyFile from '../lib/copyFile';
import validateDownload from './validateDownload';

export default function installExe(distPath, dest, options, callback) {
  const platform = options.platform;
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  const cachePath = path.join(options.cachePath, `node-${distPath}.exe`);
  const nodePath = NODE_FILE_PATHS[platform] || NODE_FILE_PATHS.posix;
  const execPath = path.join(dest, nodePath);

  fs.stat(execPath, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
    queue.defer(validateDownload.bind(null, distPath, cachePath));
    queue.defer(copyFile.bind(null, cachePath, execPath));
    queue.await(callback);
  });
}
