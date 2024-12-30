const path = require('path');
const Queue = require('queue-cb');
const mkdirp = require('mkdirp-classic');

const resolveVersions = require('node-resolve-versions');

const installVersion = require('./installVersion');

const DEFAULT_INSTALL_PATH = path.join(require('homedir-polyfill')(), '.nir');
const DEFAULT_OPTIONS = {
  cachePath: path.join(DEFAULT_INSTALL_PATH, 'cache'),
  buildPath: path.join(DEFAULT_INSTALL_PATH, 'build'),
  downloadURL: function downloadURL(relativePath) {
    return `https://nodejs.org/dist/${relativePath}`;
  },
};

module.exports = function install(versionDetails, dest, options, callback) {
  options = { ...DEFAULT_OPTIONS, ...options, path: 'raw' };
  resolveVersions(versionDetails, options, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`Could not resolve versions for: ${JSON.stringify(versionDetails)}`));

    const results = [];
    const queue = new Queue(1);
    queue.defer((cb) => mkdirp(options.cachePath, cb.bind(null, null)));
    versions.forEach((version) => {
      queue.defer((cb) => {
        const installPath = dest && versions.length > 1 ? path.join(dest, version) : dest;
        installVersion(version, installPath, options, (err, fullPath) => {
          if (err) return cb(err);
          results.push({ version: version.version, error: err, fullPath: fullPath });
          cb();
        });
      });
    });
    queue.await((err) => (err ? callback(err) : callback(null, results)));
  });
};
