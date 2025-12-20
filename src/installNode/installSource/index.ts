import { safeRm } from 'fs-remove-compat';
import path from 'path';
import Queue from 'queue-cb';
import tempSuffix from 'temp-suffix';

import { NODE_DIST_BASE_URL } from '../../constants.ts';
import conditionalCache from '../../lib/conditionalCache.ts';
import extract from '../../lib/extract.ts';
import type { InstallOptions, NoParamCallback } from '../../types.ts';
import validateDownload from '../validateDownload.ts';
import buildPosix from './buildPosix.ts';
import buildWin32 from './buildWin32.ts';

export default function InstallSource(distPath: string, dest: string, options: InstallOptions, callback: NoParamCallback): void {
  const platform = options.platform;
  const build = platform === 'win32' ? buildWin32 : buildPosix;
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  // Use temp build path to avoid race conditions with parallel builds
  const tempBuildPath = tempSuffix(path.join(options.buildPath, path.basename(distPath)));
  const cachePath = path.join(options.cachePath, path.basename(downloadPath));

  const queue = new Queue(1);
  queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
  queue.defer(validateDownload.bind(null, distPath, cachePath));
  queue.defer(extract.bind(null, cachePath, tempBuildPath));
  queue.defer(build.bind(null, tempBuildPath, dest, options));
  queue.await((err) => {
    // Always clean up temp build directory
    safeRm(tempBuildPath, () => callback(err));
  });
}
