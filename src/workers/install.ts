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

import type { InstallCallback, InstallOptions } from '../types.ts';

type GetVersionsCallback = (error?: Error, results?: string[]) => undefined;
function getVersions(versionExpression: string, options: InstallOptions, callback: GetVersionsCallback): undefined {
  // short circuit
  isVersion(versionExpression) ? callback(null, [versionExpression]) : resolveVersions(versionExpression, options, callback);
}

export default function install(versionExpression: string, options: InstallOptions, callback: InstallCallback): undefined {
  const storagePaths = options.storagePath ? createStoragePaths(options.storagePath) : DEFAULT_STORAGE_PATHS;
  options = { ...storagePaths, ...options, ...getTarget(options) };
  getVersions(versionExpression, options, (err?: Error, versions?: string[]): undefined => {
    if (err) {
      callback(err);
      return;
    }
    if (!versions.length) {
      callback(new Error(`Could not resolve versions for: ${versionExpression}`));
      return;
    }
    if (versions.length !== 1) {
      callback(new Error(`Version ${versionExpression} resolved to multiple versions: ${versions.map((x) => x)}. Expecting one.`));
      return;
    }

    const version = versions[0];
    const result = createResult(options, version);

    checkMissing(result.installPath, options, (err, missing): undefined => {
      if (err || !missing.length) {
        callback(err, result);
        return;
      }

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, options.cachePath));
      queue.defer(ensureDestinationParent.bind(null, result.installPath));
      !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, result.installPath, options));
      !~missing.indexOf('npm') || queue.defer(installNPM.bind(null, version, result.installPath, options));
      queue.await((err) => (err ? callback(err) : callback(null, result)));
    });
  });
}
