var spawn = require('cross-spawn-cb');

module.exports = function installWin32(buildPath, dest, options, callback) {
  spawn('./vcbuild', ['--prefix=' + dest], { stdio: 'inherit', cwd: buildPath }, function (err, res) {
    if (err || res.code !== 0) return callback(err || new Error('Build failed ' + buildPath));
    callback();
  });
};
