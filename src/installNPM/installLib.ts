import crypto from 'crypto';
import fs from 'fs';
import { getContent } from 'get-file-compat';
import { getDist } from 'node-filename-to-dist-paths';
import oo from 'on-one';
import path from 'path';
import Queue from 'queue-cb';
import { NPM_DIST_TAGS_URL, NPM_DIST_URL, NPM_MIN_VERSION } from '../constants.ts';
import conditionalCache from '../lib/conditionalCache.ts';
import extract from '../lib/extract.ts';

interface DistRecord {
  latest: string;
}

import type { InstallOptions } from '../types.ts';

export type Callback = (error?: Error, npmVersion?: string, checksum?: string) => void;

function calculateChecksum(filePath: string, callback: (err?: Error, checksum?: string) => void): void {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  stream.on('data', (data) => hash.update(data));
  oo(stream, ['error', 'end', 'close', 'finish'], (err?: Error) => {
    if (err) return callback(err);
    callback(null, hash.digest('hex'));
  });
}

export default function installLib(version: string, dest: string, options: InstallOptions, callback: Callback): void {
  const platform = options.platform;
  const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  const installPath = path.join(libPath, 'node_modules', 'npm');

  const dist = getDist(version);
  const npmMajorPair = dist && dist.npm ? +dist.npm.split('.')[0] : NPM_MIN_VERSION;
  const npmMajor = Math.max(npmMajorPair, NPM_MIN_VERSION);

  getContent(NPM_DIST_TAGS_URL, 'utf8', (err, res) => {
    if (err) return callback(err);
    try {
      const distTags = JSON.parse(res.content) as DistRecord;
      const npmVersion = distTags[`latest-${npmMajor}`] || distTags[`next-${npmMajor}`] || distTags.latest;
      const downloadPath = `${NPM_DIST_URL}/-/npm-${npmVersion}.tgz`;
      const cachePath = path.join(options.cachePath, path.basename(downloadPath));

      let checksum: string | undefined;
      const queue = new Queue(1);
      queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
      queue.defer((cb) => {
        calculateChecksum(cachePath, (err, hash) => {
          checksum = hash;
          cb(err);
        });
      });
      queue.defer(extract.bind(null, cachePath, installPath));
      queue.await((err) => {
        err ? callback(err) : callback(null, npmVersion, checksum);
      });
    } catch (_e) {
      return callback(new Error('Failed to parse npm dist-tags'));
    }
  });
}
