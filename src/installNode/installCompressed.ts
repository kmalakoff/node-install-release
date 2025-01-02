import path from 'path';
import access from 'fs-access-compat';
import rimraf2 from 'rimraf2';

import conditionalCache from '../lib/conditionalCache';
import conditionalExtract from '../lib/conditionalExtract';
import progress from '../lib/progress.js';

export default function installCompressed(relativePath, dest, _record, options, callback) {
  const downloadPath = options.downloadURL(relativePath);
  const cachePath = path.join(options.cachePath, path.basename(downloadPath));

  conditionalCache(downloadPath, cachePath, (err) => {
    if (err) return callback(err);
    access(dest, (err) => {
      if (!err) return callback(); // already exists
      conditionalExtract(cachePath, dest, { strip: 1, progress: progress, time: 1000, ...options }, (err) => {
        console.log('');
        if (err) return callback(err);

        // some compressed versions of node come with npm pre-installed, but we want to override with a specific version
        const platform = options.platform || process.platform;
        const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
        const installPath = path.join(libPath, 'node_modules', 'npm');
        rimraf2(installPath, { disableGlob: true }, () => {
          callback(err);
        });
      });
    });
  });
}
