import path from 'path';
import access from 'fs-access-compat';
import Queue from 'queue-cb';

import { NODE_DIST_BASE_URL } from '../constants';
import conditionalCache from '../lib/conditionalCache';
import copyFile from '../lib/copyFile';
import validateDownload from './validateDownload';

export default function installExe(distPath, dest, options, callback) {
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  const cachePath = path.join(options.cachePath, `node-${distPath}.exe`);
  const destPath = path.join(dest, path.basename(distPath));

  access(destPath, (err) => {
    if (!err) return callback(); // already exists

    console.log(1);
    const queue = new Queue(1);
    queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
    queue.defer(validateDownload.bind(null, distPath, cachePath));
    queue.defer(copyFile.bind(null, cachePath, destPath));
    queue.await(callback);
  });
}
