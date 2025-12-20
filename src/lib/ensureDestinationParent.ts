import mkdirp from 'mkdirp-classic';
import path from 'path';

import type { NoParamCallback } from '../types.ts';

export default function ensureDestinationParent(dest: string, callback: NoParamCallback): void {
  const parent = path.dirname(dest);
  if (parent === '.' || parent === '/') return callback();
  mkdirp(parent, callback);
}
