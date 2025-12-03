import type { NoParamCallback } from 'fs';
import { copyFile } from 'fs-copy-compat';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';

import ensureDestinationParent from './ensureDestinationParent.ts';

export default function safeCopyFile(src: string, dest: string, callback: NoParamCallback) {
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
