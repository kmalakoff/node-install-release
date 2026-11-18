import Module from 'module';
import type { Verify } from 'staged-cache';
import { stagedCache } from 'staged-cache';
import type { NoParamCallback } from '../types.ts';
import httpStatusError from './httpStatusError.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

// The one place a download enters the cache: it is fetched into a staging file beside `dest`, checked there and only then renamed into place,
// so a bad body (a non-2xx response, a corrupt or truncated file) is never at `dest`, not even briefly.
export default function cacheDownload(endpoint: string, dest: string, verify: Verify, callback: NoParamCallback): void {
  stagedCache(
    dest,
    {
      verify,
      build: (staging, cb) => {
        // deferred: get-file-compat is only needed when the file is actually missing from cache
        const { getFile } = _require('get-file-compat');
        getFile(endpoint, staging, (err: Error | null, res?: { statusCode?: number }) => {
          if (err) return cb(err);
          cb(httpStatusError(endpoint, res?.statusCode));
        });
      },
    },
    (err) => (err ? callback(err) : callback())
  );
}
