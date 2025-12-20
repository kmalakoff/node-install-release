import fs from 'fs';
import { getFile } from 'get-file-compat';
import type { InstallOptions, NoParamCallback } from '../types.ts';
import ensureDestinationParent from './ensureDestinationParent.ts';

export default function conditionalCache(endpoint: string, dest: string, options: InstallOptions, callback?: NoParamCallback): void {
  callback = typeof options === 'function' ? options : callback;
  options = typeof options === 'function' ? {} : ((options || {}) as InstallOptions);

  fs.stat(dest, (err) => {
    if (!err) return callback(); // already exists
    ensureDestinationParent(dest, (err) => {
      err ? callback(err) : getFile(endpoint, dest, callback);
    });
  });
}
