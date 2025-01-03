import path from 'path';
import extract from 'fast-extract';
import access from 'fs-access-compat';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';

export default function conditionalExtract(src, dest, options, callback?) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(mkdirp.bind(null, path.dirname(dest)));
    queue.defer(extract.bind(null, src, dest, { strip: 1, time: 1000, ...options }));
    queue.await(callback);
  });
}
