import path from 'path';
import Queue from 'queue-cb';

import { NODE_DIST_BASE_URL } from '../constants.ts';
import conditionalCache from '../lib/conditionalCache.ts';
import extract from '../lib/extract.ts';
import type { ChecksumCallback, ChecksumResult, InstallOptions } from '../types.ts';
import validateDownload from './validateDownload.ts';

export default function installCompressed(distPath: string, dest: string, options: InstallOptions, callback: ChecksumCallback): void {
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  const cachePath = path.join(options.cachePath, path.basename(downloadPath));

  let checksum: ChecksumResult | undefined;
  const queue = new Queue(1);
  queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
  queue.defer((cb) => {
    validateDownload(distPath, cachePath, (err, result) => {
      checksum = result;
      cb(err);
    });
  });
  queue.defer(extract.bind(null, cachePath, dest, { strip: 1, time: 1000 }));
  queue.await((err) => callback(err, checksum));
}
