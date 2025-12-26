import fs from 'fs';
import type { NoParamCallback } from '../types.ts';
import copyFile from './copyFile.ts';

export default function conditionalCopy(src: string, dest: string, optional: boolean, callback: NoParamCallback): void {
  if (typeof optional === 'function') return callback(new Error('conditionalCopy missing options'));

  fs.stat(dest, (err) => {
    if (!err) return callback(); // already exists

    fs.stat(src, (err) => {
      err && optional ? callback() : copyFile(src, dest, callback); // optional file missing
    });
  });
}
