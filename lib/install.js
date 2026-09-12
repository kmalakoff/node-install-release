var path = require('path');
var Queue = require('queue-cb');
var mkpath = require('mkpath');
var assign = require('object-assign');

var installNode = require('./installNode');
var installNPM = require('./installNPM');
var everyBinAccess = require('./everyBinAccess');
var resolveVersion = require('./resolveVersion');

var NIR_DIR = path.join(require('osenv').home(), '.nir');
var DEFAULT_OPTIONS = {
  cacheDirectory: path.join(NIR_DIR, 'cache'),
  buildDirectory: path.join(NIR_DIR, 'build'),
  downloadURL: function downloadURL(relativePath) {
    return 'https://nodejs.org/dist/' + relativePath;
  },
};
var PLATFORM_FILES = {
  win32: ['node.exe', 'npm', 'npm.cmd'],
  posix: ['node', 'npm'],
};

module.exports = function install(versionString, dest, options, callback) {
  options = assign({}, DEFAULT_OPTIONS, options);
  resolveVersion(versionString, options, function (err, version) {
    if (err) return callback(err);

    // use cwd if dest not provided
    if (!dest) dest = path.join(process.cwd(), version);

    var platform = options.platform || process.platform;
    everyBinAccess(PLATFORM_FILES[platform] || PLATFORM_FILES.posix, dest, options, function (err) {
      if (!err) return callback(null, dest); // already installed

      var queue = new Queue(1);
      queue.defer(function (callback) {
        mkpath(options.cacheDirectory, callback.bind(null, null));
      });
      queue.defer(function (callback) {
        mkpath(dest, callback.bind(null, null));
      });
      queue.defer(installNode.bind(null, version, dest, options));
      queue.defer(installNPM.bind(null, version, dest, options));
      queue.await(function (err) {
        err ? callback(err) : callback(null, dest);
      });
    });
  });
};
