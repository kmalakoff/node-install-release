import crypto from 'crypto';
import fs from 'fs';
import eos from 'end-of-stream';
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
    const input = fs.createReadStream(installPath);
    input.on('data', (data) => hash.update(data));
    eos(input, (err) => {
      if (err) return callback(err);
      const digest = hash.digest('hex');
      console.log(`hash ${digest === expected ? 'matches' : 'different'} for ${filename}`);
      digest !== expected ? callback(new Error(`SHASUMS256 failed for ${filename}`)) : callback();
    });
  });
}
