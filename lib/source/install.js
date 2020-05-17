var distPaths = require('node-filename-to-dist-paths');

module.exports = function findInstaller(version, dest, options, callback) {
  var relativePaths = distPaths('src', version);
  if (!relativePaths.length) return callback(new Error('Source distrubtion paths not found'));

  var platform = options.platform || process.platform;

  callback(new Error('Source install not implemented'));
};
