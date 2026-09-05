import isMusl from '../lib/isMusl.ts';
import type { ChecksumResult, NoParamCallback, ResolvedInstallOptions } from '../types.ts';
import installFilename from './installFilename.ts';
import searchList from './searchList.ts';

export default function install(version: string, dest: string, options: ResolvedInstallOptions, callback: NoParamCallback): void {
  const filenames = searchList(version, options, isMusl());

  const tryNext = (cb: (err?: Error | null, checksum?: ChecksumResult) => void, lastErr?: Error) => {
    if (filenames.length === 0) {
      const msg = `Failed to find installable for ${version}${options.filename ? ` Filename: ${options.filename}` : ''}`;
      return cb(new Error(lastErr ? `${msg}: ${lastErr.message}` : msg));
    }
    const filename = filenames.shift() as string;
    installFilename(filename, version, dest, options, (err, checksum) => (err ? tryNext(cb, err) : cb(undefined, checksum)));
  };
  tryNext((err, checksum) => {
    let message = `node ${version.slice(1)}`;
    if (!err) {
      message += ' installed';
      if (checksum) message += ` (${checksum.actual.slice(0, 8)})`;
    } else {
      message += ' install failed';
      if (checksum) message += ` (${checksum.actual} expecting ${checksum.expected})`;
      message += `. Error: ${err.message}`;
    }
    console.log(message);
    callback(err);
  });
}
