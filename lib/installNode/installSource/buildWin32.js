var path = require('path');
var spawn = require('cross-spawn-cb');
var Queue = require('queue-cb');
var conditionalCopy = require('../../conditionalCopy');

module.exports = function installWin32(buildPath, dest, options, callback) {
  var queue = new Queue(1);
  queue.defer(function (callback) {
    spawn('./vcbuild', [], { stdio: 'inherit', cwd: buildPath }, function (err, res) {
      if (err || res.code !== 0) return callback(err || new Error('Build failed ' + buildPath));
      callback();
    });
  });
  queue.defer(conditionalCopy.bind(null, path.join(buildPath, 'out', 'Release', 'node.exe'), path.join(dest, 'node.exe')));
  queue.await(callback);

};    
