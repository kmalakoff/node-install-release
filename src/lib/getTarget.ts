import { FILE_PLATFORMS, FILE_PLATFORM_MAP } from '../constants.js';
import machineArch from '../machine/arch.cjs';

let archMachine: NodeJS.Architecture;
export default function getTarget(options) {
  let platform = options.platform;
  let arch = options.arch;
  if (options.filename) {
    const filePlatform = options.filename.split('-')[0];
    if (FILE_PLATFORMS.indexOf(filePlatform) >= 0) platform = FILE_PLATFORM_MAP[filePlatform] || filePlatform;
    arch = options.filename.split('-')[1];
  }
  if (!platform) platform = process.platform;
  if (!arch) {
    if (!archMachine) archMachine = machineArch() as NodeJS.Architecture; // call first time needed
    arch = archMachine;
  }
  return { platform, arch };
}
