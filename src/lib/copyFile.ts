import fs from 'fs';
import pump from 'pump';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';

import ensureDestinationParent from './ensureDestinationParent';

function streamCopyFile(src, dest, callback) {
  fs.stat(src, (err) => {
    if (err) return callback(err);
    pump(fs.createReadStream(src), fs.createWriteStream(dest), callback);
  });
}

const copyFile = fs.copyFile || streamCopyFile;

export default function safeCopyFile(src, dest, callback) {
  const queue = new Queue(1);

  queue.defer(ensureDestinationParent.bind(null, dest));
  queue.defer((callback) => {
    rimraf2(dest, { disableGlob: true }, (err) => {
      err && err.code !== 'EEXIST' ? callback(err) : callback();
    });
  });
  queue.defer(copyFile.bind(null, src, dest));
  queue.await(callback);
}
