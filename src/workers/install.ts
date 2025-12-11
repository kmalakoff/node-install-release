import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import mkdirp from 'mkdirp-classic';
import { getDist } from 'node-filename-to-dist-paths';
import resolveVersions from 'node-resolve-versions';
import path from 'path';
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

    // Check if node is missing first
    checkMissing(result.installPath, options, (err, missing): undefined => {
      if (err) {
        callback(err);
        return;
      }

      // Early exit if both node and npm are already present
      if (!missing.length) {
        callback(null, result);
        return;
      }

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, options.cachePath));
      queue.defer(ensureDestinationParent.bind(null, result.installPath));

      // Install node if missing
      !~missing.indexOf('node') || queue.defer(installNode.bind(null, version, result.installPath, options));

      // Check and install npm AFTER node (so bundled npm is detected)
      // Skip npm download only if bundled npm is modern (6+); old npm (<6) was buggy
      queue.defer((cb) => {
        checkMissing(result.installPath, options, (err, npmMissing): undefined => {
          if (err) {
            cb(err);
            return;
          }
          if (!~npmMissing.indexOf('npm')) {
            // npm is present - check if it's modern enough to keep (npm >= 3 is stable)
            const dist = getDist(version);
            const bundledNpmMajor = dist && dist.npm ? +dist.npm.split('.')[0] : 0;
            if (bundledNpmMajor >= 3) {
              cb(); // npm >= 3 bundled, skip download
              return;
            }
            // old npm (<3) is buggy - delete it so installNPM can override
            const platform = options.platform;
            const libPath = platform === 'win32' ? result.installPath : path.join(result.installPath, 'lib');
            const npmPath = path.join(libPath, 'node_modules', 'npm');
            safeRm(npmPath, () => installNPM(version, result.installPath, options, cb));
            return;
          }
          installNPM(version, result.installPath, options, cb);
        });
      });

      queue.await((err) => (err ? callback(err) : callback(null, result)));
    });
  });
}
