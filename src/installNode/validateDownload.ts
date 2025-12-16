import crypto from 'crypto';
import fs from 'fs';
import { getContent } from 'get-file-compat';
import oo from 'on-one';
import { NODE_DIST_BASE_URL } from '../constants.ts';

import type { ChecksumCallback, ChecksumResult } from '../types.ts';

export default function validateDownload(distPath: string, installPath: string, callback: ChecksumCallback): undefined {
  const version = distPath.split('/')[0];
  const downloadPath = `${NODE_DIST_BASE_URL}/${version}/SHASUMS256.txt`;
  getContent(downloadPath, 'utf8', (err, res) => {
    if (err) return callback(err);
    const text = res.content;
    const filename = distPath.split('/').slice(1).join('/');
    const expected = text.split(filename)[0].split('\n').pop().trim();
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(installPath);
    stream.on('data', (data) => hash.update(data));
    oo(stream, ['error', 'end', 'close', 'finish'], (err?: Error) => {
      if (err) {
        callback(err);
        return;
      }
      const actual = hash.digest('hex');
      const match = actual === expected;
      const checksum: ChecksumResult = { actual, expected, match };
      match ? callback(null, checksum) : callback(new Error(`${filename} checksum failed`), checksum);
    });
  });
}
