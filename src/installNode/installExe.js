const path = require('path');
const access = require('fs-access-compat');

const conditionalCache = require('../conditionalCache');
const copyFile = require('../copyFile');

module.exports = function installExe(relativePath, dest, record, options, callback) {
  const downloadPath = options.downloadURL(relativePath);
  const cachePath = path.join(options.cachePath, `node-${record.version}.exe`);
  const destPath = path.join(dest, path.basename(relativePath));

  access(destPath, (err) => {
    if (!err) return callback(); // already exists
    conditionalCache(downloadPath, cachePath, (err) => {
      if (err) return callback(err);
      copyFile(cachePath, destPath, callback);
    });
  });
};
