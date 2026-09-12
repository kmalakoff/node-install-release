var path = require('path');
var find = require('lodash.find');

var endsWithFn = require('../endsWithFn');
var findDistPaths = require('./findDistPaths');
var installCompressed = require('./installCompressed');
var installExe = require('./installExe');
var installSource = require('./installSource');
var everyBinAccess = require('../everyBinAccess');

var PLATFORM_FILES = {
  win32: ['node.exe'],
  posix: ['node'],
};

module.exports = function install(version, dest, options, callback) {
  var platform = options.platform || process.platform;
  everyBinAccess(PLATFORM_FILES[platform] || PLATFORM_FILES.posix, dest, options, function (err) {
    if (!err) return callback(); // already installed

    var record = findDistPaths(version, options);
    if (record) {
      if (record.filename === 'src') return installSource(record.relativePaths[0], dest, record, options, callback);

      var relativePath = find(record.relativePaths, endsWithFn(['.tar.gz', '.zip']));
      if (relativePath) return installCompressed(relativePath, dest, record, options, callback);

      relativePath = find(record.relativePaths, endsWithFn('.exe'));
      if (relativePath) return installExe(relativePath, dest, record, options, callback);
    }

    record = findDistPaths(version, { filename: 'src' });
    if (record && record.relativePaths.length) return installSource(record.relativePaths[0], dest, record, options, callback);

    callback(new Error('Unable to install ' + version));
  });
};
