var find = require('lodash.find');
var distPaths = require('node-filename-to-dist-paths');

var endsWithFn = require('../../endsWithFn');
var InstallExe = require('./installExe');
var InstallTarGz = require('./InstallTarGz');
var InstallZip = require('./InstallZip');
var prebuiltFilenames = require('./filenames');

module.exports = function installPrebuilt(version, dest, options, callback) {
  var filenames = prebuiltFilenames(options);
  var relativePaths = [];
  for (var index = 0; index < filenames.length; index++) {
    relativePaths = distPaths(filenames[index], version);
    if (relativePaths.length) break;
  }
  if (!relativePaths.length) return callback(null, false);

  var relativePath = find(relativePaths, endsWithFn('.tar.gz'));
  if (relativePath) return InstallTarGz(relativePath, dest, version, options, callback);

  relativePath = find(relativePaths, endsWithFn('.zip'));
  if (relativePath) return InstallZip(relativePath, dest, version, options, callback);

  relativePath = find(relativePaths, endsWithFn('.exe'));
  if (relativePath) return InstallExe(relativePath, dest, version, options, callback);

  return callback(null, false);
};
