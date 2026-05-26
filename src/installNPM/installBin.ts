import path from 'path';
import Queue from 'queue-cb';
import { NPM_FILE_PATHS } from '../constants.ts';
import conditionalCopy from '../lib/conditionalCopy.ts';

import type { InstallOptions, NoParamCallback } from '../types.ts';

export default function installBin(_version: string, dest: string, options: InstallOptions, callback: NoParamCallback) {
  const platform = options.platform;
  const files = (NPM_FILE_PATHS as Record<string, import('../types.ts').FilePath[]>)[platform as string] || NPM_FILE_PATHS.posix;

  const queue = new Queue();
  files.forEach((file: import('../types.ts').FilePath) => {
    queue.defer((cb) => conditionalCopy(path.join(dest, file.src), path.join(dest, file.dest), file.optional ?? false, (err) => cb(err)));
  });
  queue.await(callback);
}
