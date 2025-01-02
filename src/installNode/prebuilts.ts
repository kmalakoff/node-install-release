import os from 'os';
import arch from '../lib/arch.cjs';

const PLATFORM_OS = {
  win32: 'win',
  darwin: 'osx',
};

const PLATFORM_FILES = {
  win32: ['zip', 'exe'],
  darwin: ['tar'],
};
let machineArch = null;

export default function prebuilts(options) {
  if (!machineArch) machineArch = arch();
  const platform = options.platform || process.platform;
  const os = PLATFORM_OS[platform] || platform;
  const archs = [];
  if (options.arch) archs.push(options.arch);
  archs.push(machineArch);
  if (os.arch) archs.push(os.arch());
  if (platform === 'darwin' && machineArch === 'arm64') archs.push('x64'); // fallback

  const files = PLATFORM_FILES[platform];
  const results = [];
  for (let i = 0; i < archs.length; i++) {
    if (typeof files === 'undefined') {
      results.push(`${os}-${archs[i]}`);
    } else {
      for (let j = 0; j < files.length; j++) {
        results.push(`${os}-${archs[i]}-${files[j]}`);
      }
    }
  }
  return results;
}
