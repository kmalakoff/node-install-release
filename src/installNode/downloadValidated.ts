import { verifySha256 } from 'staged-cache';
import cacheDownload from '../lib/cacheDownload.ts';
import type { ChecksumCallback, ChecksumResult, ResolvedInstallOptions } from '../types.ts';
import fetchExpectedChecksum from './fetchExpectedChecksum.ts';

// A cached file whose sha256 is not the published one is fetched again; a download that fails it is fetched once more, then reported.
// Nothing that fails the checksum is ever left at cachePath.
export default function downloadValidated(distPath: string, downloadPath: string, cachePath: string, options: ResolvedInstallOptions, callback: ChecksumCallback, retry = true): void {
  fetchExpectedChecksum(distPath, (err, expected) => {
    if (err || expected === undefined) return callback(err);

    const check = verifySha256(expected);
    let received = true; // false once the file just downloaded (not the one already cached) fails the checksum
    cacheDownload(
      downloadPath,
      cachePath,
      (path, cb) =>
        check(path, (err, ok) => {
          if (!err && path !== cachePath) received = !!ok;
          cb(err, ok);
        }),
      (err) => {
        if (!err) return callback(undefined, { actual: expected, expected, match: true });
        if (received) return callback(err);
        if (retry) return downloadValidated(distPath, downloadPath, cachePath, options, callback, false);
        // the hash of what was received is not kept by the cache, so only the expected one is known
        const checksum: ChecksumResult = { actual: '', expected, match: false };
        callback(new Error(`${distPath.split('/').slice(1).join('/')} checksum failed`), checksum);
      }
    );
  });
}
