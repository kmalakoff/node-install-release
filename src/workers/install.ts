import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import mkdirp from 'mkdirp-classic';
import Module from 'module';
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

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

type GetVersionsCallback = (error?: Error | null, results?: string[]) => void;
function getVersions(versionExpression: string, options: InstallOptions, callback: GetVersionsCallback) {
  // short circuit
  if (isVersion(versionExpression)) return callback(undefined, [versionExpression]);
  // deferred: node-resolve-versions pulls node-semvers/fetch-json-cache, only needed for a non-literal version expression
  const resolveVersionsModule = _require('node-resolve-versions');
  const resolveVersions = resolveVersionsModule.default || resolveVersionsModule;
  resolveVersions(versionExpression, options, (err?: Error | null, result?: string[] | unknown[]) => callback(err, result as string[] | undefined));
}

export default function install(versionExpression: string, options: InstallOptions, callback: InstallCallback): void {
  const storagePaths = options.storagePath ? createStoragePaths(options.storagePath) : DEFAULT_STORAGE_PATHS;
  options = { ...storagePaths, ...options, ...getTarget(options) };
  getVersions(versionExpression, options, (err?: Error | null, versions?: string[]): void => {
    if (err) return callback(err);
    if (!versions || !versions.length) {
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
      if (!err) return callback(undefined, result);

      // Folder doesn't exist - do atomic install with temp folder
      const tempPath = tempSuffix(result.installPath);

      const queue = new Queue(1);
      queue.defer((cb) => mkdirp(options.cachePath!, (err) => cb(err)));
      queue.defer(ensureDestinationParent.bind(null, tempPath));

      // Install node to temp folder
      queue.defer(installNode.bind(null, version, tempPath, options));

      // Check and install npm to temp folder
      // Skip npm download only if bundled npm is modern (>= 3)
      queue.defer((cb) => {
        checkMissing(tempPath, options, (err, npmMissing): void => {
          if (err) return cb(err);
          // npm not bundled with node - download it
          if (~(npmMissing || []).indexOf('npm')) return installNPM(version, tempPath, options, cb);

          // npm is present (bundled with node) - keep it unless the dist index positively says it is ancient (<3)
          // deferred: node-filename-to-dist-paths pulls fetch-json-cache, only needed to check a bundled npm's age
          const { getDistAsync } = _require('node-filename-to-dist-paths');
          getDistAsync(version, (_err: Error | null, dist: { npm?: string }) => {
            const bundledNpmIsAncient = dist && dist.npm && +dist.npm.split('.')[0] < 3;
            if (!bundledNpmIsAncient) return cb(); // unknown version keeps the bundled npm

            // old npm (<3) is buggy - delete it so installNPM can override
            const platform = options.platform;
            const libPath = platform === 'win32' ? tempPath : path.join(tempPath, 'lib');
            const npmPath = path.join(libPath, 'node_modules', 'npm');
            safeRm(npmPath, () => installNPM(version, tempPath, options, cb));
          });
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
        // Clean up temp folder on error
        if (err) return safeRm(tempPath, () => callback(err));

        callback(undefined, result);
      });
    });
  });
}
