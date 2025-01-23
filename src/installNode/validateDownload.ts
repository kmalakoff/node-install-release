import crypto from 'crypto';
import fs from 'fs';
import once from 'call-once-fn';
import get from 'get-remote';
import { NODE_DIST_BASE_URL } from '../constants';
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
    const end = once((err) => {
      if (err) return callback(err);
      hash.digest('hex') !== expected ? callback(new Error(`${filename} checksum failed`)) : callback();
    });
    stream.on('error', end);
    stream.on('end', end);
    stream.on('close', end);
    stream.on('finish', end);
  });
}
