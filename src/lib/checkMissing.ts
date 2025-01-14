import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';

import { NODE_FILE_PATHS, NPM_FILE_PATHS } from '../constants';

export default function checkMissing(dest, options, callback) {
  const platform = options.platform;
  const nodePath = NODE_FILE_PATHS[platform] || NODE_FILE_PATHS.posix;
  const npmPaths = NPM_FILE_PATHS[platform] || NPM_FILE_PATHS.posix;

  const missing = [];
  function check(filePath, key, cb) {
    fs.stat(path.join(dest, filePath), (err) => {
      if (err && missing.indexOf(key) < 0) missing.push(key);
      cb();
    });
  }

  const queue = new Queue();
  queue.defer(check.bind(null, nodePath, 'node'));
  for (const key in npmPaths) {
    if (!npmPaths[key].optional) queue.defer(check.bind(null, npmPaths[key].dest, 'npm'));
  }
  queue.await(() => callback(null, missing));
}
