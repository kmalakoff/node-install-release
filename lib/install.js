var path = require('path');
var Queue = require('queue-cb');
var mkpath = require('mkpath');
var assign = require('object-assign');

var installNode = require('./installNode');
var installNPM = require('./installNPM');
var validateInstall = require('./validateInstall');
var resolveVersion = require('./resolveVersion');

var NIR_DIR = path.join(require('osenv').home(), '.nir');
var DEFAULT_OPTIONS = {
  cacheDirectory: path.join(NIR_DIR, 'cache'),
  buildDirectory: path.join(NIR_DIR, 'build'),
  downloadURL: function downloadURL(relativePath) {
    return 'https://nodejs.org/dist/' + relativePath;
  },
};

module.exports = function install(versionString, dest, options, callback) {
  options = assign({}, DEFAULT_OPTIONS, options);
  resolveVersion(versionString, options, function (err, version) {
    if (err) return callback(err);

    // use cwd if dest not provided
    if (!dest) dest = path.join(process.cwd(), version.version);

    validateInstall(dest, options, function (err, missing) {
      if (err || !missing.length) return callback(err, dest);

      var queue = new Queue(1);
      queue.defer(function (callback) {
        mkpath(options.cacheDirectory, callback.bind(null, null));
      });
      queue.defer(function (callback) {
        mkpath(dest, callback.bind(null, null));
      });
      !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, dest, options));
      !~missing.indexOf('npm') || queue.defer(installNPM.bind(null, version, dest, options));
      queue.await(function (err) {
        err ? callback(err) : callback(null, dest);
      });
    });
  });
};
