const distPaths = require('node-filename-to-dist-paths');
const prebuilts = require('./prebuilts');

module.exports = function findDistPaths(version, options) {
  const filenames = options.filename ? [options.filename] : prebuilts(options);
  for (let index = 0; index < filenames.length; index++) {
    const filename = filenames[index];
    if (!~version.files.indexOf(filename)) continue;
    const relativePaths = distPaths(filename, version.version);
    if (relativePaths && relativePaths.length) return { version: version.version, filename: filename, relativePaths: relativePaths };
  }
  return null;
};
