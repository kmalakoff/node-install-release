import path from 'path';
import Queue from 'queue-cb';
import conditionalCopy from '../lib/conditionalCopy.js';

import { NPM_FILE_PATHS } from '../constants.js';

export default function installBin(_version, dest, options, callback) {
  const platform = options.platform;
  const files = NPM_FILE_PATHS[platform] || NPM_FILE_PATHS.posix;

  const queue = new Queue();
  files.forEach((file) => queue.defer(conditionalCopy.bind(null, path.join(dest, file.src), path.join(dest, file.dest), file.optional)));
  queue.await(callback);
}
