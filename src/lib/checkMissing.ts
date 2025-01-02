import fs from 'fs';
import path from 'path';
import keys from 'lodash.keys';

const PLATFORM_FILES = {
  win32: {
    node: ['node.exe'],
    npm: ['npm', 'npm.cmd'],
  },
  posix: {
    node: ['node'],
    npm: ['npm'],
  },
};

export default function checkMissing(dest, options, callback) {
  const platform = options.platform || process.platform;
  const files = PLATFORM_FILES[platform] || PLATFORM_FILES.posix;
  const binPath = platform === 'win32' ? dest : path.join(dest, 'bin');

  fs.readdir(binPath, (err, names) => {
    if (err || !names.length) return callback(null, keys(files));

    const missing = [];
    for (const key in files) {
      const needed = files[key];
      for (let index = 0; index < needed.length; index++) {
        if (!~names.indexOf(needed[index])) {
          missing.push(key);
          break;
        }
      }
    }
    return callback(null, missing);
  });
}
