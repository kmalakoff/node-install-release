import type { InstallCallback, InstallOptions, InstallResult } from './types.ts';
import worker from './workers/install.ts';

export type * from './types.ts';

export default function install(versionExpression: string): Promise<InstallResult>;
export default function install(versionExpression: string, options: InstallOptions): Promise<InstallResult>;

export default function install(versionExpression: string, callback: InstallCallback): void;
export default function install(versionExpression: string, options: InstallOptions, callback: InstallCallback): void;

export default function install(versionExpression: string, optionsOrCallback?: InstallOptions | InstallCallback, callback?: InstallCallback): void | Promise<InstallResult> {
  const options = typeof optionsOrCallback === 'function' ? {} : ((optionsOrCallback || {}) as InstallOptions);
  const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;

  if (typeof cb === 'function') return worker(versionExpression, options, cb);
  return new Promise((resolve, reject) => worker(versionExpression, options, (err, result) => (err ? reject(err) : resolve(result))));
}
export { default as createResult } from './createResult.ts';
export { default as createStoragePaths } from './createStoragePaths.ts';
