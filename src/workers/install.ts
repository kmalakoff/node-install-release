import path from 'path';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import { NODE, isWindows } from '../constants';

import home from 'homedir-polyfill';
import createStoragePaths from '../createStoragePaths';
const DEFAULT_ROOT_PATH = path.join(home(), '.nir');
const DEFAULT_STORAGE_PATHS = createStoragePaths(DEFAULT_ROOT_PATH);

import resolveVersions from 'node-resolve-versions';

import installNPM from '../installNPM/index';
import installNode from '../installNode/index';
import checkMissing from '../lib/checkMissing';
import ensureDestinationParent from '../lib/ensureDestinationParent';

const DEFAULT_OPTIONS = {
  downloadURL: function downloadURL(relativePath) {
    return `https://nodejs.org/dist/${relativePath}`;
  },
};

export default function install(versionExpression, options, callback) {
  const storagePaths = options.storagePath ? createStoragePaths(options.storagePath) : DEFAULT_STORAGE_PATHS;
  const dest = options.installPath ? options.installPath : storagePaths.installPath;

  options = { ...storagePaths, ...DEFAULT_OPTIONS, ...options, path: 'raw' };
  resolveVersions(versionExpression, options, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`Could not resolve versions for: ${versionExpression}`));
    if (versions.length !== 1) return callback(new Error(`Version ${versionExpression} resolved to multiple versions: ${versions.map((x) => x.version)}. Expecting one.`));

    mkdirp(options.cachePath, (err) => {
      if (err) return callback(err);
      const version = versions[0];

      let installPath = dest;
      if (options.name) installPath = path.join(installPath, options.name);
      else if (!options.installPath) installPath = path.join(installPath, version.version);
      const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
      const execPath = path.join(binRoot, NODE);

      checkMissing(dest, options, (err, missing) => {
        if (err || !missing.length) return callback(err, dest);

        const queue = new Queue(1);
        queue.defer(ensureDestinationParent.bind(null, dest));
        !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, dest, options));
        !~missing.indexOf('npm') || queue.defer(installNPM.bind(null, version, dest, options));
        queue.await((err) => {
          err ? callback(err) : callback(null, { version: version.version, installPath, execPath });
        });
      });
    });
  });
}
