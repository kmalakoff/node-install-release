var distPaths = require('node-filename-to-dist-paths');
var prebuiltFilenames = require('./filenames');

module.exports = function findDistPaths(version, options) {
  if (options.filename) {
    var relativePaths = distPaths(options.filename, version);
    if (relativePaths && relativePaths.length) return { version: version, filename: options.filename, relativePaths: relativePaths };
  } else {
    var filenames = prebuiltFilenames(options);
    for (var index = 0; index < filenames.length; index++) {
      // eslint-disable-next-line no-redeclare
      var relativePaths = distPaths(filenames[index], version);
      if (relativePaths && relativePaths.length) return { version: version, filename: filenames[index], relativePaths: relativePaths };
    }
  }
  return null;
};
