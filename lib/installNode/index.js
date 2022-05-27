var findDistPaths = require('./findDistPaths');
var installCompressed = require('./installCompressed');
var installExe = require('./installExe');
var installSource = require('./installSource');

module.exports = function install(version, dest, options, callback) {
  var record = findDistPaths(version, options);
  if (record) {
    if (record.filename === 'src') return installSource(record.relativePaths[0], dest, record, options, callback);

    var compressRegExp = /\.(tar\.gz|zip)$/;
    var relativePath = record.relativePaths.find((s) => compressRegExp.test(s));
    if (relativePath) return installCompressed(relativePath, dest, record, options, callback);

    relativePath = record.relativePaths.find((s) => s.endsWith('.exe'));
    if (relativePath) return installExe(relativePath, dest, record, options, callback);
  }

  record = findDistPaths(version, { filename: 'src' });
  if (record && record.relativePaths.length) return installSource(record.relativePaths[0], dest, record, options, callback);

  callback(new Error('Unable to install ' + version));
};
