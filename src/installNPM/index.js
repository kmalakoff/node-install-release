const installBin = require('./installBin');
const installLib = require('./installLib');

module.exports = function install(version, dest, options, callback) {
  installLib(version, dest, options, (err) => {
    if (err) return callback(err);
    installBin(version, dest, options, callback);
  });
};
