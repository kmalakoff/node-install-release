import { FILE_PLATFORM_MAP, FILES } from '../constants.ts';
import type { ResolvedInstallOptions } from '../types.ts';

// nodejs.org ships a musl build for linux-x64 only, from v24.20.0 and v26.8.0 up
const MUSL_MIN_MAJOR = 24;

// musl is a parameter, not detected here, so both branches are specced on every OS
export default function searchList(version: string, options: ResolvedInstallOptions, musl: boolean): string[] {
  // a specific filename
  if (options.filename) return [options.filename];

  // infer with fallbacks
  const { platform, arch } = options;
  const filePlatform = (FILE_PLATFORM_MAP as Record<string, string>)[platform as string] || platform;
  const suffix: string[] = [];
  if (options.type) suffix.push(options.type);
  if (options.compression) suffix.push(options.compression as unknown as string);

  // generate the files in search order
  const filenames: string[] = [];
  if (musl && platform === 'linux' && arch === 'x64' && parseInt(version.replace(/^v/, ''), 10) >= MUSL_MIN_MAJOR) {
    filenames.push([filePlatform, arch, 'musl'].concat(suffix).join('-'));
  }
  [arch, process.arch].forEach((a) => {
    filenames.push([filePlatform, a].concat(suffix).join('-'));
  });
  ((FILES as Record<string, { filename: string }[]>)[filePlatform as string] || []).forEach((x: { filename: string }) => {
    filenames.push(x.filename);
  });
  filenames.push('src');
  return filenames.filter((filename, i) => filenames.indexOf(filename) === i);
}
