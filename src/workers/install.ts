import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import mkdirp from 'mkdirp-classic';
import { getDist } from 'node-filename-to-dist-paths';
import resolveVersions from 'node-resolve-versions';
import path from 'path';
import Queue from 'queue-cb';
import tempSuffix from 'temp-suffix';

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

    // Fast path: with atomic installs, folder exists = complete installation
    fs.stat(result.installPath, (err) => {
      if (!err) {
        callback(null, result);
        return;
      }

      // Folder doesn't exist - do atomic install with temp folder
      const tempPath = tempSuffix(result.installPath);

      const queue = new Queue(1);
      queue.defer(mkdirp.bind(null, options.cachePath));
      queue.defer(ensureDestinationParent.bind(null, tempPath));

      // Install node to temp folder
      queue.defer(installNode.bind(null, version, tempPath, options));

      // Check and install npm to temp folder
      // Skip npm download only if bundled npm is modern (>= 3)
      queue.defer((cb) => {
        checkMissing(tempPath, options, (err, npmMissing): undefined => {
          if (err) {
            cb(err);
            return;
          }
          if (!~npmMissing.indexOf('npm')) {
            // npm is present (bundled with node) - check if it's modern enough to keep
            const dist = getDist(version);
            const bundledNpmMajor = dist && dist.npm ? +dist.npm.split('.')[0] : 0;
            if (bundledNpmMajor >= 3) {
              cb(); // npm >= 3 bundled, skip download
              return;
            }
            // old npm (<3) is buggy - delete it so installNPM can override
            const platform = options.platform;
            const libPath = platform === 'win32' ? tempPath : path.join(tempPath, 'lib');
            const npmPath = path.join(libPath, 'node_modules', 'npm');
            safeRm(npmPath, () => installNPM(version, tempPath, options, cb));
            return;
          }
          installNPM(version, tempPath, options, cb);
        });
      });

      // Atomic rename: move temp folder to final destination
      queue.defer((cb) => {
        fs.rename(tempPath, result.installPath, (err) => {
          if (!err) return cb();
          // Race condition: another process may have already created dest
          if (err.code === 'EEXIST' || err.code === 'ENOTEMPTY' || err.code === 'EPERM') {
            // Another process won the race - clean up temp and succeed
            safeRm(tempPath, () => cb());
            return;
          }
          cb(err);
        });
      });

      queue.await((err) => {
        if (err) {
          // Clean up temp folder on error
          safeRm(tempPath, () => callback(err));
          return;
        }
        callback(null, result);
      });
    });
  });
}
