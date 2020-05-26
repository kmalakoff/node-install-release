var NodeSemvers = require('node-semvers');
var isArray = require('isarray');
var assign = require('object-assign');

module.exports = function resolveVersion(versionString, options, callback) {
  NodeSemvers.load({ cache: options.cache }, function (err, semvers) {
    if (err) return callback(err);

    var version = semvers.resolve(versionString, assign({}, options, { path: 'raw' }));
    if (!version) return callback(new Error('Unrecognized version' + versionString));
    if (isArray(version)) return callback(new Error('Version string does not resolve to a single version ' + versionString));
    callback(null, version);
  });
};
