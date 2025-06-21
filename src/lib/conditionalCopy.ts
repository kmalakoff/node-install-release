import fs from 'fs';
import copyFile from './copyFile.ts';

export default function conditionalCopy(src, dest, optional, callback) {
  if (typeof optional === 'function') return callback(new Error('conditionalCopy missing options'));

  fs.stat(dest, (err) => {
    if (!err) return callback(); // already exists

    fs.stat(src, (err) => {
      err && optional ? callback() : copyFile(src, dest, callback); // optional file missing
    });
  });
}
