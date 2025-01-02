import path from 'path';
import { DEFAULT_STORAGE_PATHS, NODE, isWindows } from './constants';

import createStoragePaths from './createStoragePaths';
import type { InstallOptions, InstallResult } from './types';

export default function createResult(options: InstallOptions, version: string): InstallResult {
  const storagePaths = options.storagePath ? createStoragePaths(options.storagePath) : DEFAULT_STORAGE_PATHS;
  let installPath = options.installPath || storagePaths.installPath;

  if (options.name) installPath = path.join(installPath, options.name);
  else if (!options.installPath) installPath = path.join(installPath, version);
  const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, NODE);
  return { version, installPath, execPath };
}
