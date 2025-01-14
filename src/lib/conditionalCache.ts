import fs from 'fs';
import path from 'path';
import get from 'get-remote';

import ensureDestinationParent from './ensureDestinationParent';

export default function conditionalCache(endpoint, dest, options, callback?) {
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
