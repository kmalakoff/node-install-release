const path = require('path');
const mkdirp = require('mkdirp-classic');

module.exports = function ensureDestinationParent(dest, callback) {
  const parent = path.dirname(dest);
  if (parent === '.' || parent === '/') return callback();
  mkdirp(parent, (err) => {
    callback(err);
  });
};
