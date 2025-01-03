import access from 'fs-access-compat';
import copyFile from './copyFile';

export default function conditionalCopy(src, dest, optional, callback) {
  if (typeof optional === 'function') return callback(new Error('conditionalCopy missing options'));

  access(dest, (err) => {
    if (!err) return callback(); // already exists

    access(src, (err) => {
      err && optional ? callback() : copyFile(src, dest, callback); // optional file missing
    });
  });
}
