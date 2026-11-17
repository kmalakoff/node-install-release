import fs from 'fs';
import conditionalCache from '../lib/conditionalCache.ts';
import type { ChecksumCallback, ChecksumResult, ResolvedInstallOptions } from '../types.ts';
import validateDownload from './validateDownload.ts';

// A file that fails its checksum is removed so it is never a cache hit again; a cached one is fetched once more.
export default function downloadValidated(distPath: string, downloadPath: string, cachePath: string, options: ResolvedInstallOptions, callback: ChecksumCallback, retry = true): void {
  conditionalCache(downloadPath, cachePath, options, (err) => {
    if (err) return callback(err);
    validateDownload(distPath, cachePath, (err, checksum?: ChecksumResult) => {
      if (!err || !checksum || checksum.match) return callback(err, checksum);
      fs.unlink(cachePath, (unlinkErr) => {
        if (unlinkErr && (unlinkErr as NodeJS.ErrnoException).code !== 'ENOENT') return callback(unlinkErr);
        if (retry) return downloadValidated(distPath, downloadPath, cachePath, options, callback, false);
        callback(err, checksum);
      });
    });
  });
}
