import type { InstallCallback, InstallOptions, InstallResult } from './types.ts';
import worker from './workers/install.ts';

export type * from './types.ts';

export default function install(versionExpression: string): Promise<InstallResult>;
export default function install(versionExpression: string, options: InstallOptions): Promise<InstallResult>;

export default function install(versionExpression: string, callback: InstallCallback): undefined;
export default function install(versionExpression: string, options: InstallOptions, callback: InstallCallback): undefined;

export default function install(versionExpression: string, options?: InstallOptions | InstallCallback, callback?: InstallCallback): undefined | Promise<InstallResult> {
  if (typeof options === 'function') {
    callback = options as InstallCallback;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(versionExpression, options, callback) as undefined;
  return new Promise((resolve, reject) =>
    worker(versionExpression, options, (err, result) => {
      err ? reject(err) : resolve(result);
    })
  );
}
export { default as createResult } from './createResult.ts';
export { default as createStoragePaths } from './createStoragePaths.ts';
