import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import mkdirp from 'mkdirp-classic';
import Module from 'module';
import path from 'path';
import Queue from 'queue-cb';
import { stagedCache } from 'staged-cache';

import { DEFAULT_STORAGE_PATHS } from '../constants.ts';

import createResult from '../createResult.ts';
import createStoragePaths from '../createStoragePaths.ts';
import installNode from '../installNode/index.ts';

import installNPM from '../installNPM/index.ts';
import checkMissing from '../lib/checkMissing.ts';
import ensureDestinationParent from '../lib/ensureDestinationParent.ts';
import getTarget from '../lib/getTarget.ts';

import type { InstallCallback, InstallOptions, ResolvedInstallOptions } from '../types.ts';

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
  // ?? not spread order: an explicitly-undefined path in the caller's options would overwrite the default
  const resolved: ResolvedInstallOptions = {
    ...options,
    ...getTarget(options),
    cachePath: options.cachePath ?? storagePaths.cachePath,
    buildPath: options.buildPath ?? storagePaths.buildPath,
    installPath: options.installPath ?? storagePaths.installPath,
  };
  getVersions(versionExpression, resolved, (err?: Error | null, versions?: string[]): void => {
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
    const result = createResult(resolved, version);

    // an install is complete when it holds a node binary. This tool only ever builds into a path that is missing or an empty folder:
    // anything else at installPath that is not a complete install was not made by us (installs are staged and renamed in whole,
    // so a partial one never appears there) and is never removed or built over.
    const nodePath = path.relative(result.installPath, result.execPath);
    const hasNode = (installed: string, cb: (ok: boolean) => void) => fs.stat(path.join(installed, nodePath), (err, stats) => cb(!err && stats.isFile()));
    stagedCache(
      result.installPath,
      {
        verify: (installed, cb) =>
          hasNode(installed, (ok) => {
            if (ok || installed !== result.installPath) return cb(null, ok);
            // stagedCache asks this of installPath before it removes anything: an error here stops it
            fs.lstat(installed, (err, stats) => {
              if (err) return err.code === 'ENOENT' ? cb(null, false) : cb(err); // missing: build; unreadable: stop
              const foreign = () => cb(new Error(`${installed} exists and is not an install of node ${version}; not changing it`));
              if (!stats.isDirectory()) return foreign(); // a file or a link of any kind is never replaced
              fs.readdir(installed, (err, entries) => (err ? cb(err) : entries.length === 0 ? cb(null, false) : foreign()));
            });
          }),
        build: (tempPath, buildCallback) => {
          const queue = new Queue(1);
          queue.defer((cb) => mkdirp(resolved.cachePath, (err) => cb(err)));
          queue.defer(ensureDestinationParent.bind(null, tempPath));

          // Install node to temp folder
          queue.defer(installNode.bind(null, version, tempPath, resolved));

          // Check and install npm to temp folder
          // Skip npm download only if bundled npm is modern (>= 3)
          queue.defer((cb) => {
            checkMissing(tempPath, resolved, (err, npmMissing): void => {
              if (err) return cb(err);
              // npm not bundled with node - download it
              if (~(npmMissing || []).indexOf('npm')) return installNPM(version, tempPath, resolved, cb);

              // npm is present (bundled with node) - keep it unless the dist index positively says it is ancient (<3)
              // deferred: node-filename-to-dist-paths pulls fetch-json-cache, only needed to check a bundled npm's age
              const { getDistAsync } = _require('node-filename-to-dist-paths');
              getDistAsync(version, (_err: Error | null, dist: { npm?: string }) => {
                const bundledNpmIsAncient = dist && dist.npm && +dist.npm.split('.')[0] < 3;
                if (!bundledNpmIsAncient) return cb(); // unknown version keeps the bundled npm

                // old npm (<3) is buggy - delete it so installNPM can override
                // resolved, not options: callers omit platform and getTarget fills it
                const platform = resolved.platform;
                const libPath = platform === 'win32' ? tempPath : path.join(tempPath, 'lib');
                const npmPath = path.join(libPath, 'node_modules', 'npm');
                safeRm(npmPath, () => installNPM(version, tempPath, resolved, cb));
              });
            });
          });

          queue.await((err) => buildCallback(err));
        },
      },
      (err) => (err ? callback(err) : callback(undefined, result))
    );
  });
}
