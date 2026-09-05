import searchList from '../../src/installNode/searchList.ts';
import getTarget from '../../src/lib/getTarget.ts';
import isMusl from '../../src/lib/isMusl.ts';
import type { InstallOptions, ResolvedInstallOptions } from '../../src/types.ts';

// whether the artifact the installer picks first for this target is a musl build
export default function installsMusl(version: string, options: InstallOptions): boolean {
  const filenames = searchList(version, { ...options, ...getTarget(options) } as ResolvedInstallOptions, isMusl());
  return filenames[0].indexOf('-musl') >= 0;
}
