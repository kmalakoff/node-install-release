import path from 'path';
import Queue from 'queue-cb';

import { NODE_DIST_BASE_URL } from '../../constants.ts';
import conditionalCache from '../../lib/conditionalCache.ts';
import conditionalExtract from '../../lib/conditionalExtract.ts';
import type { InstallOptions, NoParamCallback } from '../../types.ts';
import validateDownload from '../validateDownload.ts';
import buildPosix from './buildPosix.ts';
import buildWin32 from './buildWin32.ts';

export default function InstallSource(distPath: string, dest: string, options: InstallOptions, callback: NoParamCallback): undefined {
  const platform = options.platform;
  const build = platform === 'win32' ? buildWin32 : buildPosix;
  const downloadPath = `${NODE_DIST_BASE_URL}/${distPath}`;
  const buildPath = path.join(options.buildPath, path.basename(distPath));
  const cachePath = path.join(options.cachePath, path.basename(downloadPath));

  const queue = new Queue(1);
  queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
  queue.defer(validateDownload.bind(null, distPath, cachePath));
  queue.defer(conditionalExtract.bind(null, cachePath, buildPath, { strip: 1 }));
  queue.defer(build.bind(null, buildPath, dest, options));
  queue.await(callback);
}
