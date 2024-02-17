const fs = require('fs');
const rimraf = require('rimraf');
const pump = require('pump');
const Queue = require('queue-cb');

const ensureDestinationParent = require('./ensureDestinationParent');

function streamCopyFile(src, dest, callback) {
  fs.stat(src, (err) => {
    if (err) return callback(err);
    pump(fs.createReadStream(src), fs.createWriteStream(dest), callback);
  });
}

const copyFile = fs.copyFile || streamCopyFile;

module.exports = function safeCopyFile(src, dest, callback) {
  const queue = new Queue(1);

  queue.defer(ensureDestinationParent.bind(null, dest));
  queue.defer((callback) => {
    rimraf(dest, (err) => {
      err && err.code !== 'EEXIST' ? callback(err) : callback();
    });
  });
  queue.defer(copyFile.bind(null, src, dest));
  queue.await(callback);
};
