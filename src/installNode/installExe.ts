import path from 'path';
import access from 'fs-access-compat';

import conditionalCache from '../lib/conditionalCache';
import copyFile from '../lib/copyFile';

export default function installExe(relativePath, dest, record, options, callback) {
  const downloadPath = options.downloadURL(relativePath);
  const cachePath = path.join(options.cachePath, `node-${record.version}.exe`);
  const destPath = path.join(dest, path.basename(relativePath));

  access(destPath, (err) => {
    if (!err) return callback(); // already exists
    conditionalCache(downloadPath, cachePath, (err) => {
      if (err) return callback(err);
      copyFile(cachePath, destPath, callback);
    });
  });
}
