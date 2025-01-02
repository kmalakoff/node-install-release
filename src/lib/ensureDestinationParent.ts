import path from 'path';
import mkdirp from 'mkdirp-classic';

export default function ensureDestinationParent(dest, callback) {
  const parent = path.dirname(dest);
  if (parent === '.' || parent === '/') return callback();
  mkdirp(parent, callback);
}
