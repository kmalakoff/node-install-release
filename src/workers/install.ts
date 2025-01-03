import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import { DEFAULT_STORAGE_PATHS } from '../constants';

import createResult from '../createResult';
import createStoragePaths from '../createStoragePaths';

import resolveVersions from 'node-resolve-versions';

import installNPM from '../installNPM/index';
import installNode from '../installNode/index';
import checkMissing from '../lib/checkMissing';
import ensureDestinationParent from '../lib/ensureDestinationParent';

export default function install(versionExpression, options, callback) {
  const storagePaths = options.storagePath ? createStoragePaths(options.storagePath) : DEFAULT_STORAGE_PATHS;

  options = { ...storagePaths, ...options };
  resolveVersions(versionExpression, options, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`Could not resolve versions for: ${versionExpression}`));
    if (versions.length !== 1) return callback(new Error(`Version ${versionExpression} resolved to multiple versions: ${versions.map((x) => x.version)}. Expecting one.`));

    mkdirp(options.cachePath, (err) => {
      if (err) return callback(err);
      const version = versions[0];
      const result = createResult(options, version);

      checkMissing(result.installPath, options, (err, missing) => {
        if (err || !missing.length) return callback(err, result);

        const queue = new Queue(1);
        queue.defer(ensureDestinationParent.bind(null, result.installPath));
        !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, result.installPath, options));
        !~missing.indexOf('npm') || queue.defer(installNPM.bind(null, version, result.installPath, options));
        queue.await((err) => (err ? callback(err) : callback(null, result)));
      });
    });
  });
}
