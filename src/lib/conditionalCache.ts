import fs from 'fs';
import Module from 'module';
import type { InstallOptions, NoParamCallback } from '../types.ts';
import ensureDestinationParent from './ensureDestinationParent.ts';
import httpStatusError from './httpStatusError.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export default function conditionalCache(endpoint: string, dest: string, options: InstallOptions, callback?: NoParamCallback): void {
  callback = typeof options === 'function' ? options : callback;
  options = typeof options === 'function' ? {} : ((options || {}) as InstallOptions);

  fs.stat(dest, (err) => {
    if (!err) return callback?.(); // already exists
    ensureDestinationParent(dest, (err) => {
      if (err) return callback?.(err);
      // deferred: get-file-compat is only needed when the file is actually missing from cache
      const { getFile } = _require('get-file-compat');
      getFile(endpoint, dest, (err: Error | null, res?: { statusCode?: number }) => {
        if (err) return callback?.(err);
        const statusErr = httpStatusError(endpoint, res?.statusCode);
        if (!statusErr) return callback?.();
        // never leave a bad body behind for the next run's fs.stat to treat as a cache hit
        fs.unlink(dest, (unlinkErr) => {
          if (unlinkErr && (unlinkErr as NodeJS.ErrnoException).code !== 'ENOENT') return callback?.(unlinkErr);
          callback?.(statusErr);
        });
      });
    });
  });
}
