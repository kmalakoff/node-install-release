import path from 'path';
import fromFilename from 'node-filename-to-dist-paths';
import { EXTENSIONS_COMPRESSED } from '../constants';

import installCompressed from './installCompressed';
import installExe from './installExe';
import installSource from './installSource/index';

export default function installFilename(filename, version, dest, options, callback) {
  const distPath = fromFilename(filename, version);
  if (!distPath) return callback(new Error('Not found'));
  const ext = path.extname(distPath);

  if (ext === '.exe') return installExe(distPath, dest, options, callback);
  if (EXTENSIONS_COMPRESSED.indexOf(ext) >= 0) return installCompressed(distPath, dest, options, callback);
  if (filename === 'src') return installSource(distPath, dest, options, callback);
  callback(new Error(`Unable to install ${version} distPath: ${distPath}`));
}
