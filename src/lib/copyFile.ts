import type { NoParamCallback } from 'fs';
import { copyFile } from 'fs-copy-compat';
import { safeRm } from 'fs-remove-compat';
import Queue from 'queue-cb';

import ensureDestinationParent from './ensureDestinationParent.ts';

export default function safeCopyFile(src: string, dest: string, callback: NoParamCallback) {
  const queue = new Queue(1);

  queue.defer(ensureDestinationParent.bind(null, dest));
  queue.defer((callback) => {
    safeRm(dest, callback);
  });
  queue.defer(copyFile.bind(null, src, dest));
  queue.await(callback);
}
