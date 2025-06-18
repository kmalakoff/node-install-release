import type { InstallCallback, InstallOptions, InstallResult } from './types.js';
import worker from './workers/install.js';

export type * from './types.js';
export default function install(versionExpression: string, options?: InstallOptions | InstallCallback, callback?: InstallCallback): undefined | Promise<InstallResult> {
  if (typeof options === 'function') {
    callback = options as InstallCallback;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(versionExpression, options, callback) as undefined;
  return new Promise((resolve, reject) => worker(versionExpression, options, (err, result) => (err ? reject(err) : resolve(result))));
}
export { default as createResult } from './createResult.js';
export { default as createStoragePaths } from './createStoragePaths.js';
