const path = require('path');
const access = require('fs-access-compat');
const rimraf2 = require('rimraf2');

const conditionalCache = require('../conditionalCache');
const conditionalExtract = require('../conditionalExtract');
const progress = require('../progress');

module.exports = function installCompressed(relativePath, dest, _record, options, callback) {
  const downloadPath = options.downloadURL(relativePath);
  const cachePath = path.join(options.cachePath, path.basename(downloadPath));

  conditionalCache(downloadPath, cachePath, (err) => {
    if (err) return callback(err);
    access(dest, (err) => {
      if (!err) return callback(); // already exists
      conditionalExtract(cachePath, dest, { strip: 1, progress: progress, time: 1000, ...options }, (err) => {
        console.log('');
        if (err) return callback(err);

        // some compressed versions of node come with npm pre-installed, but we want to override with a specific version
        const platform = options.platform || process.platform;
        const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
        const installPath = path.join(libPath, 'node_modules', 'npm');
        rimraf2(installPath, { disableGlob: true }, () => {
          callback(err);
        });
      });
    });
  });
};
