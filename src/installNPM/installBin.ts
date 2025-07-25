import path from 'path';
import Queue from 'queue-cb';
import { NPM_FILE_PATHS } from '../constants.ts';
import conditionalCopy from '../lib/conditionalCopy.ts';

import type { InstallOptions, NoParamCallback } from '../types.ts';

export default function installBin(_version: string, dest: string, options: InstallOptions, callback: NoParamCallback) {
  const platform = options.platform;
  const files = NPM_FILE_PATHS[platform] || NPM_FILE_PATHS.posix;

  const queue = new Queue();
  files.forEach((file) => queue.defer(conditionalCopy.bind(null, path.join(dest, file.src), path.join(dest, file.dest), file.optional)));
  queue.await(callback);
}
