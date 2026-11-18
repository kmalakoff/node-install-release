import fs from 'fs';
import type { VerifyCallback } from 'staged-cache';

// For a cache entry with no published hash: present, a file and not empty. A missing path is a miss, not an error.
export default function isNonEmptyFile(path: string, callback: VerifyCallback): void {
  fs.stat(path, (err, stats) => callback(null, !err && stats.isFile() && stats.size > 0));
}
