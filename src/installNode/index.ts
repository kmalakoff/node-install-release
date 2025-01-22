import installFilename from './installFilename';

import { FILES, FILE_PLATFORM_MAP } from '../constants';

export default function install(version, dest, options, callback) {
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
    (FILES[filePlatform] || []).forEach((x) => filenames.push(x.filename));
    filenames.push('src');
    filenames = filenames.filter((filename, i) => filenames.indexOf(filename) === i);
  }

  const tryNext = (cb) => {
    if (filenames.length === 0) return cb(new Error(`Failed to find installable for ${version}${options.filename ? ` Filename: ${options.filename}` : ''}`));
    installFilename(filenames.shift(), version, dest, options, (err) => (err ? tryNext(cb) : cb()));
  };
  tryNext((err) => {
    console.log(`node ${version.slice(1)} ${!err ? 'installed' : `install failed. Error: ${err.message}`}`);
    callback(err);
  });
}
