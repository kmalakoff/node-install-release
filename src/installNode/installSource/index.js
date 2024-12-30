const path = require('path');
const Queue = require('queue-cb');

const conditionalCache = require('../../conditionalCache');
const conditionalExtract = require('../../conditionalExtract');
const buildPosix = require('./buildPosix');
const buildWin32 = require('./buildWin32');

module.exports = function InstallSource(relativePath, dest, _record, options, callback) {
  const platform = options.platform || process.platform;
  const build = platform === 'win32' ? buildWin32 : buildPosix;
  const downloadPath = options.downloadURL(relativePath);
  const buildPath = path.join(options.buildPath, path.basename(relativePath));
  const cachePath = path.join(options.cachePath, path.basename(downloadPath));

  const queue = new Queue(1);
  queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
  queue.defer(conditionalExtract.bind(null, cachePath, buildPath, { strip: 1 }));
  queue.defer(build.bind(null, buildPath, dest, options));
  queue.await(callback);
};
