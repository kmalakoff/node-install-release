import path from 'path';
import get from 'get-remote';

import conditionalCache from '../lib/conditionalCache';
import conditionalExtract from '../lib/conditionalExtract';

const NODE_DIST_URL = 'https://nodejs.org/dist/index.json';
const NPM_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/npm/dist-tags';
const NPM_DIST_URL = 'https://registry.npmjs.org/npm';
const NPM_MIN_VERSION = 3;

interface ReleaseRecord {
  version: string;
  npm: string;
}

interface DistRecord {
  latest: string;
}

export default function installLib(version, dest, options, callback) {
  const platform = options.platform || process.platform;
  const libPath = platform === 'win32' ? dest : path.join(dest, 'lib');
  const installPath = path.join(libPath, 'node_modules', 'npm');

  get(NODE_DIST_URL).json((err, res1) => {
    if (err) return callback(err);
    const releases = res1.body as ReleaseRecord[];

    const found = releases.find((record) => record.version === version.version);
    const npmMajorPair = found && found.npm ? +found.npm.split('.')[0] : NPM_MIN_VERSION;
    const npmMajor = Math.max(npmMajorPair, NPM_MIN_VERSION);

    get(NPM_DIST_TAGS_URL).json((err, res2) => {
      if (err) return callback(err);
      const distTags = res2.body as DistRecord;
      const installVersion = distTags[`latest-${npmMajor}`] || distTags[`next-${npmMajor}`] || distTags.latest;
      const downloadPath = `${NPM_DIST_URL}/-/npm-${installVersion}.tgz`;
      const cachePath = path.join(options.cachePath, path.basename(downloadPath));
      conditionalCache(downloadPath, cachePath, (err) => {
        if (err) return callback(err);
        conditionalExtract(cachePath, installPath, callback);
      });
    });
  });
}
