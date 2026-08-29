import crypto from 'crypto';
import fs from 'fs';
import Module from 'module';
import oo from 'on-one';
import { NODE_DIST_BASE_URL } from '../constants.ts';

import type { ChecksumCallback, ChecksumResult } from '../types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export default function validateDownload(distPath: string, installPath: string, callback: ChecksumCallback): void {
  const version = distPath.split('/')[0];
  const downloadPath = `${NODE_DIST_BASE_URL}/${version}/SHASUMS256.txt`;
  // deferred: get-file-compat is only needed to actually download and validate a release
  const { getContent } = _require('get-file-compat');
  getContent(downloadPath, 'utf8', (err: Error | null, res: { content?: string }) => {
    if (err) return callback(err);
    const text = res?.content ?? '';
    const filename = distPath.split('/').slice(1).join('/');
    const expected = (text.split(filename)[0].split('\n').pop() ?? '').trim();
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(installPath);
    stream.on('data', (data) => hash.update(data));
    oo(stream, ['error', 'end', 'close', 'finish'], (err: Error | null) => {
      if (err) return callback(err);
      const actual = hash.digest('hex');
      const match = actual === expected;
      const checksum: ChecksumResult = { actual, expected, match };
      match ? callback(undefined, checksum) : callback(new Error(`${filename} checksum failed`), checksum);
    });
  });
}
