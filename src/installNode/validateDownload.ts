import crypto from 'crypto';
import fs from 'fs';
import get from 'get-remote';
import oo from 'on-one';
import { NODE_DIST_BASE_URL } from '../constants.ts';
export default function validateDownload(distPath, installPath, callback) {
  const version = distPath.split('/')[0];
  const downloadPath = `${NODE_DIST_BASE_URL}/${version}/SHASUMS256.txt`;
  get(downloadPath).text((err, res) => {
    if (err) return callback(err);
    const text = res.body;
    const filename = distPath.split('/').slice(1).join('/');
    const expected = text.split(filename)[0].split('\n').pop().trim();
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(installPath);
    stream.on('data', (data) => hash.update(data));
    oo(stream, ['error', 'end', 'close', 'finish'], (err) => {
      if (err) return callback(err);
      hash.digest('hex') !== expected ? callback(new Error(`${filename} checksum failed`)) : callback();
    });
  });
}
