// <<<<****************************>>>>
// Inline until merged: https://github.com/jakejarvis/arch/blob/detect-arm/index.js
// <<<<****************************>>>>
require('./execSync/polyfill.cjs');

/*! arch. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

// <<<<****************************>>>>
const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
// <<<<****************************>>>>

/**
 * Returns the operating system's CPU architecture. This is different than
 * `process.arch` or `os.arch()` which returns the architecture the Node.js (or
 * Electron) binary was compiled for.
 */
module.exports = function arch() {
  /**
   * On macOS, we need to detect if x64 Node is running because the CPU is truly
   * an Intel chip, or if it's running on Apple Silicon via Rosetta 2:
   * https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment
   */
  if (process.platform === 'darwin') {
    const nativeArm = process.arch === 'arm64';
    const rosettaArm = cp.execSync('sysctl -in sysctl.proc_translated', { encoding: 'utf8' }) === '1\n';

    return nativeArm || rosettaArm ? 'arm64' : 'x64';
  }

  /**
   * On Windows, the most reliable way to detect a 64-bit OS from within a 32-bit
   * app is based on the presence of a WOW64 file: %SystemRoot%\SysNative.
   * See: https://twitter.com/feross/status/776949077208510464
   */
  // <<<<****************************>>>>
  if (isWindows) {
    // <<<<****************************>>>>
    let useEnv = false;
    try {
      useEnv = !!(process.env.SYSTEMROOT && fs.statSync(process.env.SYSTEMROOT));
    } catch (_err) {}

    const sysRoot = useEnv ? process.env.SYSTEMROOT : 'C:\\Windows';

    // If %SystemRoot%\SysNative exists, we are in a WOW64 FS Redirected application.
    let isWOW64 = false;
    try {
      isWOW64 = !!fs.statSync(path.join(sysRoot, 'sysnative'));
    } catch (_err) {}

    return isWOW64 ? 'x64' : 'x86';
  }

  /**
   * On Linux, use the `getconf` command to get the architecture.
   */
  if (process.platform === 'linux') {
    try {
      const output1 = cp.execSync('uname -a', { encoding: 'utf8' });
      if (~output1.indexOf('raspberrypi')) return 'arm-pi';
    } catch (_err) {}

    const output = cp.execSync('getconf LONG_BIT', { encoding: 'utf8' });
    return output === '64\n' ? 'x64' : 'x86';
  }

  // <<<<****************************>>>>
  /**
   * The running binary is 64-bit, so the OS is clearly 64-bit.
   */
  if (process.arch === 'x64') {
    return 'x64';
  }
  // <<<<****************************>>>>

  /**
   * If none of the above, assume the architecture is 32-bit.
   */
  return 'x86';
};
