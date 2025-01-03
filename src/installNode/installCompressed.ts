import path from 'path';
import access from 'fs-access-compat';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';

import { NODE_DIST_BASE_URL } from '../constants';
import conditionalCache from '../lib/conditionalCache';
import conditionalExtract from '../lib/conditionalExtract';
import progress from '../lib/progress.js';
import validateDownload from './validateDownload';

export default function installCompressed(distPath, dest, options, callback) {
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  const cachePath = path.join(options.cachePath, path.basename(downloadPath));

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
    queue.defer(validateDownload.bind(null, distPath, cachePath));
    queue.defer(conditionalExtract.bind(null, cachePath, dest, { strip: 1, progress: progress, time: 1000, ...options }));
    queue.await((err) => {
      // some compressed versions of node come with npm pre-installed, but we want to override with a specific version
      const platform = options.platform || process.platform;
      const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
      const installPath = path.join(libPath, 'node_modules', 'npm');
      rimraf2(installPath, { disableGlob: true }, () => callback(err));
    });
  });
}
