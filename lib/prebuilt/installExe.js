var path = require('path');
var download = require('get-remote');

var DIST_URL = 'https://nodejs.org/dist/';

module.exports = function installExe(relativePath, dest, version, options, callback) {
  return download(DIST_URL + relativePath, path.join(dest, 'node.exe'), function (err) {
    err ? callback(err) : callback(null, true);
  });
};
