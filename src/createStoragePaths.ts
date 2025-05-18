import path from 'path';

import type { StorageLocations } from './types.js';

export default function createStoragePaths(storagePath: string): StorageLocations {
  return {
    cachePath: path.join(storagePath, 'cache'),
    buildPath: path.join(storagePath, 'build'),
    installPath: path.join(storagePath, 'installed'),
  };
}
