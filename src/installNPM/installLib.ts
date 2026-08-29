import crypto from 'crypto';
import fs from 'fs';
import Module from 'module';
import oo from 'on-one';
import path from 'path';
import Queue from 'queue-cb';
import { tmpdir } from '../compat.ts';
import { NPM_DIST_TAGS_URL, NPM_DIST_URL, NPM_MIN_VERSION } from '../constants.ts';
import conditionalCache from '../lib/conditionalCache.ts';
import extract from '../lib/extract.ts';

import type { InstallOptions } from '../types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export type Callback = (error?: Error | null, npmVersion?: string, checksum?: string) => void;

function calculateChecksum(filePath: string, callback: (err?: Error | null, checksum?: string) => void): void {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  stream.on('data', (data) => hash.update(data));
  oo(stream, ['error', 'end', 'close', 'finish'], (err: Error | null) => {
    if (err) return callback(err);
    callback(undefined, hash.digest('hex'));
  });
}

export default function installLib(version: string, dest: string, options: InstallOptions, callback: Callback): void {
  const platform = options.platform;
  const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  const installPath = path.join(libPath, 'node_modules', 'npm');

  // deferred: both pull fetch-json-cache / get-file-compat, only needed to actually install npm
  const { getDistAsync } = _require('node-filename-to-dist-paths');
  const { getContent } = _require('get-file-compat');
  getDistAsync(version, (_err: Error | null, dist: { npm?: string }) => {
    // pin the npm major only when the dist index knows this version; unknown means use latest
    const npmMajor = dist && dist.npm ? Math.max(+dist.npm.split('.')[0], NPM_MIN_VERSION) : null;

    getContent(NPM_DIST_TAGS_URL, 'utf8', (err: Error | null, res: { content?: string }) => {
      if (err) return callback(err);
      try {
        const distTags = JSON.parse(res?.content ?? '{}') as Record<string, string>;
        const npmVersion = npmMajor === null ? distTags.latest : distTags[`latest-${npmMajor}`] || distTags[`next-${npmMajor}`] || distTags.latest;
        const downloadPath = `${NPM_DIST_URL}/-/npm-${npmVersion}.tgz`;
        const cachePath = path.join(options.cachePath ?? tmpdir(), path.basename(downloadPath));

        let checksum: string | undefined;
        const queue = new Queue(1);
        queue.defer((cb) => conditionalCache(downloadPath, cachePath, options, (err) => cb(err)));
        queue.defer((cb) => {
          calculateChecksum(cachePath, (err, hash) => {
            checksum = hash;
            cb(err);
          });
        });
        queue.defer((cb) => extract(cachePath, installPath, (err) => cb(err)));
        queue.await((err) => {
          err ? callback(err) : callback(undefined, npmVersion, checksum);
        });
      } catch (_e) {
        return callback(new Error('Failed to parse npm dist-tags'));
      }
    });
  });
}
