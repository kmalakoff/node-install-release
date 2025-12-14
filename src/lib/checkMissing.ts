import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

import { NODE_FILE_PATHS, NPM_PACKAGE_PATH } from '../constants.ts';

import type { InstallOptions } from '../types.ts';

export type Callback = (error?: Error, missing?: string[]) => undefined;

export default function checkMissing(dest: string, options: InstallOptions, callback: Callback): undefined {
  const platform = options.platform;
  const nodePath = NODE_FILE_PATHS[platform] || NODE_FILE_PATHS.posix;
  const npmPackagePath = NPM_PACKAGE_PATH[platform] || NPM_PACKAGE_PATH.posix;

  const missing: string[] = [];
  function check(filePath, key, cb) {
    fs.stat(path.join(dest, filePath), (err) => {
      if (err && missing.indexOf(key) < 0) missing.push(key);
      cb();
    });
  }

  const queue = new Queue();
  queue.defer(check.bind(null, nodePath, 'node'));
  queue.defer(check.bind(null, npmPackagePath, 'npm'));
  queue.await(() => callback(null, missing));
}
