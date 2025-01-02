import access from 'fs-access-compat';

import copyFile from './copyFile';
import ensureDestinationParent from './ensureDestinationParent';

export default function conditionalCopy(src, dest, optional, callback) {
  if (typeof optional === 'function') {
    callback = optional;
    optional = false;
  }

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    ensureDestinationParent(dest, (err) => {
      if (err) return callback(err);
      if (!optional) return copyFile(src, dest, callback);

      access(src, (err) => {
        if (err) return callback(); // optional file missing
        copyFile(src, dest, callback);
      });
    });
  });
}
