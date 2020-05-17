var fs = require('fs');

var prebuiltInstall = require('./prebuilt/install');
var sourceInstall = require('./source/install');

module.exports = function install(version, dest, options, callback) {
  fs.readdir(dest, function (err, names) {
    if (!err && names.length && !options.force) return callback(null, true);

    prebuiltInstall(version, dest, options, function (err, installed) {
      if (err) return callback(err);
      if (installed) return callback(null, installed);
      sourceInstall(version, dest, options, callback);
    });
  });
};
