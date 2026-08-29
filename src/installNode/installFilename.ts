import Module from 'module';
import path from 'path';
import { EXTENSIONS_COMPRESSED } from '../constants.ts';
import type { ChecksumCallback, ResolvedInstallOptions } from '../types.ts';
import installCompressed from './installCompressed.ts';
import installExe from './installExe.ts';
import installSource from './installSource/index.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export default function installFilename(filename: string, version: string, dest: string, options: ResolvedInstallOptions, callback: ChecksumCallback): void {
  // deferred: node-filename-to-dist-paths pulls fetch-json-cache, only needed to actually resolve an install
  const fromFilenameModule = _require('node-filename-to-dist-paths');
  const fromFilename = fromFilenameModule.default || fromFilenameModule;
  const distPath = fromFilename(filename, version);
  if (!distPath) {
    callback(new Error('Not found'));
    return;
  }
  const ext = path.extname(distPath);

  if (filename === 'src') return installSource(distPath, dest, options, callback);
  if (ext === '.exe') return installExe(distPath, dest, options, callback);
  if (EXTENSIONS_COMPRESSED.indexOf(ext) >= 0) {
    return installCompressed(distPath, dest, options, callback);
  }
  callback(new Error(`Unable to install ${version} distPath: ${distPath}`));
}
