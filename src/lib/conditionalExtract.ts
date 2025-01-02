import path from 'path';
import extract from 'fast-extract';
import access from 'fs-access-compat';
import mkdirp from 'mkdirp-classic';

import progress from './progress.js';

export default function conditionalExtract(src, dest, options, callback?) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    mkdirp(path.dirname(dest), () => {
      extract(src, dest, { strip: 1, progress: progress, time: 1000, ...options }, (err) => {
        console.log('');
        callback(err);
      });
    });
  });
}
