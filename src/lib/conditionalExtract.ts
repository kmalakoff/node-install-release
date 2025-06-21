import extract from 'fast-extract';
import fs from 'fs';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';

import type { InstallOptions, NoParamCallback } from '../types.ts';

export default function conditionalExtract(src: string, dest: string, options: InstallOptions | NoParamCallback, callback?: NoParamCallback): undefined {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || ({} as InstallOptions);

  fs.stat(dest, (err) => {
    if (!err) return callback(); // already exists

    const queue = new Queue(1);
    queue.defer(mkdirp.bind(null, path.dirname(dest)));
    queue.defer(extract.bind(null, src, dest, { strip: 1, time: 1000 }));
    queue.await(callback);
  });
}
