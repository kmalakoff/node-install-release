var install = require('./lib/install');

function installRelease(versionString, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  if (typeof callback === 'function') return install(versionString, dest, options, callback);
  return new Promise(function (resolve, reject) {
    installRelease(versionString, dest, options, function installCallback(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
}

module.exports = installRelease;
