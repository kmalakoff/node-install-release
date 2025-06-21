import path from 'path';

import type { StorageLocations } from './types.ts';

export default function createStoragePaths(storagePath: string): StorageLocations {
  return {
    cachePath: path.join(storagePath, 'cache') as string,
    buildPath: path.join(storagePath, 'build') as string,
    installPath: path.join(storagePath, 'installed') as string,
  };
}
