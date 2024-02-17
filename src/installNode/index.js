const find = require('lodash.find');

const endsWithFn = require('../endsWithFn');
const findDistPaths = require('./findDistPaths');
const installCompressed = require('./installCompressed');
const installExe = require('./installExe');
const installSource = require('./installSource');

module.exports = function install(version, dest, options, callback) {
  let record = findDistPaths(version, options);
  if (record) {
    if (record.filename === 'src') return installSource(record.relativePaths[0], dest, record, options, callback);

    let relativePath = find(record.relativePaths, endsWithFn(['.tar.gz', '.zip']));
    if (relativePath) return installCompressed(relativePath, dest, record, options, callback);

    relativePath = find(record.relativePaths, endsWithFn('.exe'));
    if (relativePath) return installExe(relativePath, dest, record, options, callback);
  }

  record = findDistPaths(version, { filename: 'src' });
  if (record && record.relativePaths.length) return installSource(record.relativePaths[0], dest, record, options, callback);
  callback(new Error(`Unable to install ${version}`));
};
