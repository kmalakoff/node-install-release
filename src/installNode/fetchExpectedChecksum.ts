import Module from 'module';
import { NODE_DIST_BASE_URL } from '../constants.ts';
import httpStatusError from '../lib/httpStatusError.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

// The sha256 nodejs.org publishes for a release file, from that release's SHASUMS256.txt.
export default function fetchExpectedChecksum(distPath: string, callback: (err?: Error | null, expected?: string) => void): void {
  const version = distPath.split('/')[0];
  const downloadPath = `${NODE_DIST_BASE_URL}/${version}/SHASUMS256.txt`;
  // deferred: get-file-compat is only needed to actually download and validate a release
  const { getContent } = _require('get-file-compat');
  getContent(downloadPath, 'utf8', (err: Error | null, res: { content?: string; statusCode?: number }) => {
    if (err) return callback(err);
    const statusErr = httpStatusError(downloadPath, res?.statusCode);
    if (statusErr) return callback(statusErr);
    const text = res?.content ?? '';
    const filename = distPath.split('/').slice(1).join('/');
    callback(undefined, (text.split(filename)[0].split('\n').pop() ?? '').trim());
  });
}
