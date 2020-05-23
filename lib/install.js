var path = require('path');
var Queue = require('queue-cb');
var mkdirp = require('mkdirp-classic');
var assign = require('object-assign');

var installNode = require('./installNode');
var installNPM = require('./installNPM');
var resolveVersion = require('./resolveVersion');

var NIR_DIR = path.join(require('osenv').home(), '.nir');
var DEFAULT_OPTIONS = {
  cacheDirectory: path.join(NIR_DIR, 'cache'),
  downloadURL: function downloadURL(relativePath) {
    return 'https://nodejs.org/dist/' + relativePath;
  },
};

module.exports = function install(versionString, dest, options, callback) {
  options = assign({}, DEFAULT_OPTIONS, options);
  resolveVersion(versionString, options, function (err, version) {
    if (err) return callback(err);

    // use cwd if not provided
    if (!dest) dest = path.join(process.cwd(), version);

    var queue = new Queue(1);
    queue.defer(function (callback) {
      mkdirp(options.cacheDirectory, callback.bind(null, null));
    });
    queue.defer(function (callback) {
      mkdirp(dest, callback.bind(null, null));
    });
    queue.defer(installNode.bind(null, version, dest, options));
    queue.defer(installNPM.bind(null, version, dest, options));
    queue.await(function (err) {
      err ? callback(err) : callback(null, dest);
    });
  });
};
