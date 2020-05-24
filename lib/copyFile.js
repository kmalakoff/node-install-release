var path = require('path');
// var fs = require('fs');
var mkpath = require('mkpath');
var ncp = require('ncp');

function ncpCopyFile(src, dest, callback) {
  mkpath(path.dirname(dest), function () {
    ncp(src, dest, { clobber: true }, callback);
  });
}

// module.exports = fs.copyFile || ncpCopyFile;
module.exports = ncpCopyFile;
