import path from 'path';
import { DEFAULT_STORAGE_PATHS, NODE_FILE_PATHS } from './constants.ts';

import createStoragePaths from './createStoragePaths.ts';
import getTarget from './lib/getTarget.ts';
import type { InstallOptions, InstallResult } from './types.ts';

export default function createResult(options: InstallOptions, version: string): InstallResult {
  const storagePaths = options.storagePath ? createStoragePaths(options.storagePath) : DEFAULT_STORAGE_PATHS;
  let installPath = options.installPath || storagePaths.installPath;

  if (options.name) installPath = path.join(installPath, options.name);
  else if (!options.installPath) installPath = path.join(installPath, version);
  const { platform } = getTarget(options);
  const nodePath = NODE_FILE_PATHS[platform] || NODE_FILE_PATHS.posix;
  const execPath = path.join(installPath, nodePath);
  return { version, installPath, execPath, platform };
}
