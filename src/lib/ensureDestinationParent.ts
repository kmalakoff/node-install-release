import mkdirp from 'mkdirp-classic';
import path from 'path';

import type { NoParamCallback } from '../types.ts';

export default function ensureDestinationParent(dest: string, callback: NoParamCallback): undefined {
  const parent = path.dirname(dest);
  if (parent === '.' || parent === '/') {
    callback();
    return;
  }
  mkdirp(parent, callback);
}
