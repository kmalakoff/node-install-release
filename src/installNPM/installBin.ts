import path from 'path';
import Queue from 'queue-cb';
import conditionalCopy from '../lib/conditionalCopy';

import { NPM_PLATFORM_FILES } from '../constants';

export default function installBin(_version, dest, options, callback) {
  const platform = options.platform || process.platform;
  const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  const binPath = platform === 'win32' ? dest : path.join(dest, 'bin');

  const queue = new Queue();
  const files = NPM_PLATFORM_FILES[platform] || NPM_PLATFORM_FILES.posix;
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    queue.defer(conditionalCopy.bind(null, path.join(libPath, file.src), path.join(binPath, file.dest), file.optional));
  }

  queue.await(callback);
}
