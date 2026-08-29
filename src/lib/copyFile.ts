import { safeRm } from 'fs-remove-compat';
import Module from 'module';
import Queue from 'queue-cb';
import type { NoParamCallback } from '../types.ts';

import ensureDestinationParent from './ensureDestinationParent.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export default function safeCopyFile(src: string, dest: string, callback: NoParamCallback) {
  const queue = new Queue(1);

  queue.defer(ensureDestinationParent.bind(null, dest));
  queue.defer((cb) => safeRm(dest, (err) => cb(err)));
  queue.defer((cb) => {
    // deferred: fs-copy-compat is only needed when a file is actually copied
    const { copyFile } = _require('fs-copy-compat');
    copyFile(src, dest, (err: Error | null) => cb(err));
  });
  queue.await(callback);
}
