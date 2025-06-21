import get from 'get-remote';
import { getDist } from 'node-filename-to-dist-paths';
import path from 'path';
import Queue from 'queue-cb';
import { NPM_DIST_TAGS_URL, NPM_DIST_URL, NPM_MIN_VERSION } from '../constants.ts';
import conditionalCache from '../lib/conditionalCache.ts';
import conditionalExtract from '../lib/conditionalExtract.ts';

interface DistRecord {
  latest: string;
}

export default function installLib(version, dest, options, callback) {
  const platform = options.platform;
  const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  const installPath = path.join(libPath, 'node_modules', 'npm');

  const dist = getDist(version);
  const npmMajorPair = dist && dist.npm ? +dist.npm.split('.')[0] : NPM_MIN_VERSION;
  const npmMajor = Math.max(npmMajorPair, NPM_MIN_VERSION);

  get(NPM_DIST_TAGS_URL).json((err, res) => {
    if (err) return callback(err);
    const distTags = res.body as DistRecord;
    const npmVersion = distTags[`latest-${npmMajor}`] || distTags[`next-${npmMajor}`] || distTags.latest;
    const downloadPath = `${NPM_DIST_URL}/-/npm-${npmVersion}.tgz`;
    const cachePath = path.join(options.cachePath, path.basename(downloadPath));

    const queue = new Queue(1);
    queue.defer(conditionalCache.bind(null, downloadPath, cachePath));
    queue.defer(conditionalExtract.bind(null, cachePath, installPath));
    queue.await((err) => {
      err ? callback(err) : callback(null, npmVersion);
    });
  });
}
