const path = require('path');
const Queue = require('queue-cb');
const mkdirp = require('mkdirp-classic');

const resolveVersions = require('node-resolve-versions');

const installVersion = require('./installVersion');

const NIR_DIR = path.join(require('homedir-polyfill')(), '.nir');
const DEFAULT_OPTIONS = {
  cacheDirectory: path.join(NIR_DIR, 'cache'),
  buildDirectory: path.join(NIR_DIR, 'build'),
  downloadURL: function downloadURL(relativePath) {
    return `https://nodejs.org/dist/${relativePath}`;
  },
};

module.exports = function install(versionDetails, dest, options, callback) {
  options = Object.assign({}, DEFAULT_OPTIONS, options, { path: 'raw' });
  resolveVersions(versionDetails, options, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`Could not resolve versions for: ${JSON.stringify(versionDetails)}`));

    const results = [];
    const queue = new Queue(1);
    queue.defer((callback) => {
      mkdirp(options.cacheDirectory, callback.bind(null, null));
    });
    for (let index = 0; index < versions.length; index++) {
      ((version) => {
        queue.defer((callback) => {
          const installDirectory = dest && versions.length > 1 ? path.join(dest, version.version) : dest;
          installVersion(version, installDirectory, options, (err, fullPath) => {
            if (err) return callback(err);
            results.push({ version: version.version, error: err, fullPath: fullPath });
            callback();
          });
        });
      })(versions[index]);
    }
    queue.await((err) => {
      err ? callback(err) : callback(null, results);
    });
  });
};
