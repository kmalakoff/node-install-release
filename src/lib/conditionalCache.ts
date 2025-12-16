import fs from 'fs';
import { getFile } from 'get-file-compat';
import type { InstallOptions, NoParamCallback } from '../types.ts';
import ensureDestinationParent from './ensureDestinationParent.ts';

export default function conditionalCache(endpoint: string, dest: string, options: InstallOptions, callback?: NoParamCallback): undefined {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  fs.stat(dest, (err) => {
    if (!err) return callback(); // already exists

    ensureDestinationParent(dest, (err) => {
      if (err) return callback(err);
      getFile(endpoint, dest, callback);
    });
  });
}
