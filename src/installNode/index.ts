import realArch from '../machine/arch.cjs';
import installFilename from './installFilename';

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

  const archs = [arch];
  if (archs.indexOf('x64') < 0) archs.push('x64');
  if (arch !== process.arch && archs.indexOf(process.arch) < 0) archs.push(process.arch);
  const filenames = archs.map((a) => [platform, a].concat(parts.slice(2)).join('-'));
  filenames.push('src');

  const tryNext = (cb) => {
    if (filenames.length === 0) return cb(new Error(`Failed to find installable for ${version}`));
    installFilename(filenames.shift(), version, dest, options, (err) => (err ? tryNext(cb) : cb()));
  };
  tryNext(callback);
}
