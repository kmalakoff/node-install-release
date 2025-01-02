import path from 'path';
import Queue from 'queue-cb';
import conditionalCopy from '../lib/conditionalCopy';

const PLATFORM_FILES = {
  win32: [
    { src: path.join('node_modules', 'npm', 'bin', 'npm'), dest: 'npm' },
    { src: path.join('node_modules', 'npm', 'bin', 'npm.cmd'), dest: 'npm.cmd' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx'), dest: 'npx', optional: true },
    { src: path.join('node_modules', 'npm', 'bin', 'npx.cmd'), dest: 'npx.cmd', optional: true },
  ],
  posix: [
    { src: path.join('node_modules', 'npm', 'bin', 'npm-cli.js'), dest: 'npm' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx-cli.js'), dest: 'npx', optional: true },
  ],
};

export default function installBin(_version, dest, options, callback) {
  const platform = options.platform || process.platform;
  const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  const binPath = platform === 'win32' ? dest : path.join(dest, 'bin');

  const queue = new Queue();
  const files = PLATFORM_FILES[platform] || PLATFORM_FILES.posix;
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    queue.defer(conditionalCopy.bind(null, path.join(libPath, file.src), path.join(binPath, file.dest), file.optional));
  }

  queue.await(callback);
}
