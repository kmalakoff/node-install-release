var Queue = require('queue-cb');
var access = require('./access');

module.exports = function pathsExist(paths, callback) {
  var exist = true;
  function pathExists(path, callback) {
    access(path, function (err) {
      if (err) exist = false;
      callback();
    });
  }

  var queue = new Queue();
  for (var index = 0; index < paths.length; index++) queue.defer(pathExists.bind(null, paths[index]));
  queue.await(function () {
    callback(null, exist);
  });
};
