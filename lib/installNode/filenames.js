var systemArch = require('../arch');

var PLATFORM_OS = {
  win32: 'win',
  darwin: 'osx',
};

var PLATFORM_FILES = {
  win32: ['zip', 'exe'],
  darwin: ['tar'],
};

module.exports = function prebuiltFilenames(options) {
  var platform = options.platform || process.platform;
  var os = PLATFORM_OS[platform] || platform;
  var arch = options.arch || systemArch;

  var files = PLATFORM_FILES[platform];
  if (typeof files === 'undefined') return [os + '-' + arch];

  var results = [];
  for (var index = 0; index < files.length; index++) {
    results.push(os + '-' + arch + '-' + files[index]);
  }
  return results;
};
