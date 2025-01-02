import path from 'path';
import homedir from 'homedir-polyfill';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import { NODE, isWindows } from '../constants';

import resolveVersions from 'node-resolve-versions';

import installNPM from '../installNPM/index';
import installNode from '../installNode/index';
import checkMissing from '../lib/checkMissing';
import ensureDestinationParent from '../lib/ensureDestinationParent';

const DEFAULT_INSTALL_PATH = path.join(homedir(), '.nir');
const DEFAULT_OPTIONS = {
  cachePath: path.join(DEFAULT_INSTALL_PATH, 'cache'),
  buildPath: path.join(DEFAULT_INSTALL_PATH, 'build'),
  downloadURL: function downloadURL(relativePath) {
    return `https://nodejs.org/dist/${relativePath}`;
  },
};

export default function install(versionExpression, dest, options, callback) {
  options = { ...DEFAULT_OPTIONS, ...options, path: 'raw' };
  resolveVersions(versionExpression, options, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`Could not resolve versions for: ${versionExpression}`));
    if (versions.length !== 1) return callback(new Error(`Version ${versionExpression} resolved to multiple versions: ${versions.map((x) => x.version)}. Expecting one.`));

    mkdirp(options.cachePath, (err) => {
      if (err) return callback(err);
      const version = versions[0];

      const installPath = dest && versions.length > 1 ? path.join(dest, version.version) : dest;
      const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
      const execPath = path.join(binRoot, NODE);

      if (options.addVersion) dest = path.join(dest, version.version);

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
