import cpuArch from 'cpu-arch';
import { FILE_PLATFORM_MAP, FILE_PLATFORMS } from '../constants.ts';

import type { InstallOptions, Target } from '../types.ts';

const archCPU = cpuArch();

export default function getTarget(options: InstallOptions): Target {
  let platform = options.platform;
  let arch = options.arch;
  if (options.filename) {
    const filePlatform = options.filename.split('-')[0];
    if (FILE_PLATFORMS.indexOf(filePlatform) >= 0) platform = FILE_PLATFORM_MAP[filePlatform] || filePlatform;
    arch = options.filename.split('-')[1] as NodeJS.Architecture;
  }
  if (!platform) platform = process.platform;
  if (!arch) arch = archCPU as NodeJS.Architecture;
  return { platform, arch };
}
