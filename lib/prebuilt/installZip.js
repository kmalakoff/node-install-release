var download = require('get-remote');

var DIST_URL = 'https://nodejs.org/dist/';

module.exports = function installZip(relativePath, dest, version, options, callback) {
  return download(DIST_URL + relativePath, dest, { extract: true, strip: 1 }, function (err) {
    err ? callback(err) : callback(null, true);
  });
};
