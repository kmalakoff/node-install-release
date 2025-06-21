import isVersion from 'is-version';
import mkdirp from 'mkdirp-classic';
import resolveVersions from 'node-resolve-versions';
import Queue from 'queue-cb';

import { DEFAULT_STORAGE_PATHS } from '../constants.ts';

import createResult from '../createResult.ts';
import createStoragePaths from '../createStoragePaths.ts';
import installNode from '../installNode/index.ts';

import installNPM from '../installNPM/index.ts';
import checkMissing from '../lib/checkMissing.ts';
import ensureDestinationParent from '../lib/ensureDestinationParent.ts';
import getTarget from '../lib/getTarget.ts';

// short circuit
function getVersions(versionExpression, options, callback) {
  isVersion(versionExpression) ? callback(null, [versionExpression]) : resolveVersions(versionExpression, options, callback);
}

export default function install(versionExpression, options, callback) {
  const storagePaths = options.storagePath ? createStoragePaths(options.storagePath) : DEFAULT_STORAGE_PATHS;
  options = { ...storagePaths, ...options, ...getTarget(options) };
  getVersions(versionExpression, options, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`Could not resolve versions for: ${versionExpression}`));
    if (versions.length !== 1) return callback(new Error(`Version ${versionExpression} resolved to multiple versions: ${versions.map((x) => x.version)}. Expecting one.`));

    const version = versions[0];
    const result = createResult(options, version);

    checkMissing(result.installPath, options, (err, missing) => {
      if (err || !missing.length) return callback(err, result);

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, options.cachePath));
      queue.defer(ensureDestinationParent.bind(null, result.installPath));
      !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, result.installPath, options));
      !~missing.indexOf('npm') || queue.defer(installNPM.bind(null, version, result.installPath, options));
      queue.await((err) => (err ? callback(err) : callback(null, result)));
    });
  });
}
