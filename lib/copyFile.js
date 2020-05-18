var path = require('path');
// var fs = require('fs');
var mkdirp = require('mkdirp');
var ncp = require('ncp');

function ncpCopyFile(src, dest, callback) {
  mkdirp(path.basename(dest), function () {
    ncp(src, dest, { clobber: true }, callback);
  });
}

// module.exports = fs.copyFile || ncpCopyFile;
module.exports = ncpCopyFile;
