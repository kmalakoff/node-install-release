import { copyFile } from 'fs-copy-compat';
import { safeRm } from 'fs-remove-compat';
import Queue from 'queue-cb';
import type { NoParamCallback } from '../types.ts';

import ensureDestinationParent from './ensureDestinationParent.ts';

export default function safeCopyFile(src: string, dest: string, callback: NoParamCallback) {
  const queue = new Queue(1);

  queue.defer(ensureDestinationParent.bind(null, dest));
  queue.defer((cb) => safeRm(dest, (err) => cb(err ?? undefined)));
  queue.defer((cb) => copyFile(src, dest, (err) => cb(err ?? undefined)));
  queue.await(callback);
}
