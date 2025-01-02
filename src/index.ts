import './polyfills.cjs';
import worker from './workers/install';

import type { InstallCallback, InstallOptions, InstallResult } from './types';

export type * from './types';
export default function install(versionExpression: string, dest: string, options?: InstallOptions | InstallCallback, callback?: InstallCallback): undefined | Promise<InstallResult> {
  if (typeof options === 'function') {
    callback = options as InstallCallback;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(versionExpression, dest, options, callback) as undefined;
  return new Promise((resolve, reject) => worker(versionExpression, dest, options, (err, result) => (err ? reject(err) : resolve(result))));
}
