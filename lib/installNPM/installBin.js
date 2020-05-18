var path = require('path');
var fs = require('fs');
var Queue = require('queue-cb');

var access = require('../access');

var PLATFORM_FILES = {
  win32: [
    { src: path.join('node_modules', 'npm', 'bin', 'npm'), dest: 'npm' },
    { src: path.join('node_modules', 'npm', 'bin', 'npm.cmd'), dest: 'npm.cmd' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx'), dest: 'npx' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx.cmd'), dest: 'npx.cmd' },
  ],
  default: [
    { src: path.join('node_modules', 'npm', 'bin', 'npm-cli.js'), dest: 'npm' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx-cli.js'), dest: 'npx' },
  ],
};

function copyFile(file, libPath, binPath, callback) {
  var sourcePath = path.join(libPath, file.src);
  var destPath = path.join(binPath, file.dest);

  access(destPath, function (err) {
    if (!err) return callback(); // already exists

    access(sourcePath, function (err) {
      if (err) return callback(); // only copy file if it exists
      fs.copyFile(sourcePath, destPath, callback);
    });
  });
}

module.exports = function installBin(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  var libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  var binPath = platform === 'win32' ? dest : path.join(dest, 'bin');

  var queue = new Queue();
  var files = PLATFORM_FILES[platform] || PLATFORM_FILES.default;
  for (var index = 0; index < files.length; index++) {
    queue.defer(copyFile.bind(null, files[index], libPath, binPath));
  }

  queue.await(callback);
};
