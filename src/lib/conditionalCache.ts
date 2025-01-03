import path from 'path';
import access from 'fs-access-compat';
import get from 'get-remote';

import ensureDestinationParent from './ensureDestinationParent';

export default function conditionalCache(endpoint, dest, options, callback?) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    ensureDestinationParent(dest, (err) => {
      if (err) return callback(err);
      get(endpoint, { filename: path.basename(dest), time: 1000, ...options }).file(path.dirname(dest), callback);
    });
  });
}
