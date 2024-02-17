const path = require('path');
const Queue = require('queue-cb');

const installNode = require('./installNode');
const installNPM = require('./installNPM');
const checkMissing = require('./checkMissing');
const ensureDestinationParent = require('./ensureDestinationParent');

module.exports = function install(version, dest, options, callback) {
  // use cwd if dest not provided
  if (!dest) dest = path.join(process.cwd(), version.version);

  checkMissing(dest, options, (err, missing) => {
    if (err || !missing.length) return callback(err, dest);

    const queue = new Queue(1);
    queue.defer(ensureDestinationParent.bind(null, dest));
    !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, dest, options));
    !~missing.indexOf('npm') || queue.defer(installNPM.bind(null, version, dest, options));
    queue.await((err) => {
      err ? callback(err) : callback(null, dest);
    });
  });
};
