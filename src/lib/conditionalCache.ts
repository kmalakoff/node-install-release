import fs from 'fs';
import get from 'get-remote';
import path from 'path';
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
      get(endpoint, { filename: path.basename(dest), time: 1000 }).file(path.dirname(dest), callback);
    });
  });
}
