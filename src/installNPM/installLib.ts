import path from 'path';
import get from 'get-remote';
import { getDist } from 'node-filename-to-dist-paths';

import conditionalCache from '../lib/conditionalCache';
import conditionalExtract from '../lib/conditionalExtract';

import { NPM_DIST_TAGS_URL, NPM_DIST_URL, NPM_MIN_VERSION } from '../constants';

interface DistRecord {
  latest: string;
}

export default function installLib(version, dest, options, callback) {
  const platform = options.platform || process.platform;
  const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  const installPath = path.join(libPath, 'node_modules', 'npm');

  const dist = getDist(version);
  const npmMajorPair = dist && dist.npm ? +dist.npm.split('.')[0] : NPM_MIN_VERSION;
  const npmMajor = Math.max(npmMajorPair, NPM_MIN_VERSION);

  get(NPM_DIST_TAGS_URL).json((err, res) => {
    if (err) return callback(err);
    const distTags = res.body as DistRecord;
    const installVersion = distTags[`latest-${npmMajor}`] || distTags[`next-${npmMajor}`] || distTags.latest;
    const downloadPath = `${NPM_DIST_URL}/-/npm-${installVersion}.tgz`;
    const cachePath = path.join(options.cachePath, path.basename(downloadPath));
    conditionalCache(downloadPath, cachePath, (err) => {
      if (err) return callback(err);
      conditionalExtract(cachePath, installPath, callback);
    });
  });
}
