import fromFilename from 'node-filename-to-dist-paths';
import path from 'path';
import { EXTENSIONS_COMPRESSED } from '../constants.ts';

import installCompressed from './installCompressed.ts';
import installExe from './installExe.ts';
import installSource from './installSource/index.ts';

export default function installFilename(filename, version, dest, options, callback) {
  const distPath = fromFilename(filename, version);
  if (!distPath) return callback(new Error('Not found'));
  const ext = path.extname(distPath);

  if (filename === 'src') return installSource(distPath, dest, options, callback);
  if (ext === '.exe') return installExe(distPath, dest, options, callback);
  if (EXTENSIONS_COMPRESSED.indexOf(ext) >= 0) {
    // 7z is not supported by fast extract
    if (ext === '.7z') return callback(new Error('7z not supported. Make a request feature request: https://github.com/kmalakoff/node-install-release/pulls'));
    return installCompressed(distPath, dest, options, callback);
  }
  callback(new Error(`Unable to install ${version} distPath: ${distPath}`));
}
