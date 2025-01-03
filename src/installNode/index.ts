import sll from 'single-line-log2';
import realArch from '../machine/arch.cjs';
import installFilename from './installFilename';

import { FILES } from '../constants';

const PLATFORM_MAP = {
  win32: 'win',
  darwin: 'osx',
};

let archMachine: NodeJS.Architecture;
export default function install(version, dest, options, callback) {
  if (!archMachine) archMachine = realArch() as NodeJS.Architecture;
  let platform = options.platform || process.platform;
  platform = PLATFORM_MAP[platform] || platform;
  const arch = options.arch || archMachine || process.arch;
  const parts = [platform, arch];
  if (options.type) parts.push(options.type);
  if (options.compression) parts.push(options.compression);

  // generate the files in search order
  const archs = [arch, process.arch];
  let filenames = archs.map((a) => [platform, a].concat(parts.slice(2)).join('-'));
  (FILES[platform] || []).forEach((x) => filenames.push(x.filename));
  filenames.push('src');
  filenames = filenames.filter((filename, i) => filenames.indexOf(filename) === i);

  const tryNext = (cb) => {
    if (filenames.length === 0) return cb(new Error(`Failed to find installable for ${version}`));
    installFilename(filenames.shift(), version, dest, options, (err) => (err ? tryNext(cb) : cb()));
  };
  tryNext((err) => {
    sll.stdout('');
    console.log(`node ${version.slice(1)} ${!err ? 'installed' : `install failed. Error: ${err.message}`}`);
    callback(err);
  });
}
