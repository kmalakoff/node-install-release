import path from 'path';
import home from 'homedir-polyfill';
import createStoragePaths from './createStoragePaths';

export const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
export const NODE = isWindows ? 'node.exe' : 'node';

export const DEFAULT_ROOT_PATH = path.join(home(), '.nir');
export const DEFAULT_STORAGE_PATHS = createStoragePaths(DEFAULT_ROOT_PATH);
