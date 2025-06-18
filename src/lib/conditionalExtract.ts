import extract from 'fast-extract';
import fs from 'fs';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';

export default function conditionalExtract(src, dest, options, callback?) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  fs.stat(dest, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(mkdirp.bind(null, path.dirname(dest)));
    queue.defer(extract.bind(null, src, dest, { strip: 1, time: 1000 }));
    queue.await(callback);
  });
}
