const path = require('path');
const mkpath = require('mkpath');

module.exports = function ensureDestinationParent(dest, callback) {
  const parent = path.dirname(dest);
  if (parent === '.' || parent === '/') return callback();
  mkpath(parent, (err) => {
    callback(err);
  });
};
