import mkdirp from 'mkdirp-classic';
import path from 'path';

export default function ensureDestinationParent(dest, callback) {
  const parent = path.dirname(dest);
  if (parent === '.' || parent === '/') return callback();
  mkdirp(parent, callback);
}
