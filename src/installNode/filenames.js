const osArch = require('os').arch || require('../arch');

const PLATFORM_OS = {
  win32: 'win',
  darwin: 'osx',
};

const PLATFORM_FILES = {
  win32: ['zip', 'exe'],
  darwin: ['tar'],
};

module.exports = function prebuiltFilenames(options) {
  const platform = options.platform || process.platform;
  const os = PLATFORM_OS[platform] || platform;
  const archs = [options.arch || osArch()];
  if (platform === 'darwin' && archs[0] === 'arm64') archs.push('x64'); // fallback

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
};
