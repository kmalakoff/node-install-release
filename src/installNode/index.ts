import { FILE_PLATFORM_MAP, FILES } from '../constants.ts';
import type { ChecksumResult, InstallOptions, NoParamCallback } from '../types.ts';
import installFilename from './installFilename.ts';

export default function install(version: string, dest: string, options: InstallOptions, callback: NoParamCallback): void {
  let filenames = null;

  // a specific filename
  if (options.filename) filenames = [options.filename];
  // infer with fallbacks
  else {
    const { platform, arch } = options;
    const filePlatform = FILE_PLATFORM_MAP[platform] || platform;
    const parts = [filePlatform, arch];
    if (options.type) parts.push(options.type);
    if (options.compression) parts.push(options.compression);

    // generate the files in search order
    const archs = [arch, process.arch];
    filenames = archs.map((a) => [filePlatform, a].concat(parts.slice(2)).join('-'));
    (FILES[filePlatform] || []).forEach((x) => {
      filenames.push(x.filename);
    });
    filenames.push('src');
    filenames = filenames.filter((filename, i) => filenames.indexOf(filename) === i);
  }

  const tryNext = (cb: (err?: Error, checksum?: ChecksumResult) => void, lastErr?: Error) => {
    if (filenames.length === 0) {
      const msg = `Failed to find installable for ${version}${options.filename ? ` Filename: ${options.filename}` : ''}`;
      return cb(new Error(lastErr ? `${msg}: ${lastErr.message}` : msg));
    }
    installFilename(filenames.shift(), version, dest, options, (err, checksum) => (err ? tryNext(cb, err) : cb(null, checksum)));
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
