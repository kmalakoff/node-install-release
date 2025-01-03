import path from 'path';
import home from 'homedir-polyfill';
// @ts-ignore
import files from '../../assets/files.cjs';
import createStoragePaths from './createStoragePaths';

export const FILES = files;

export const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
export const NODE = isWindows ? 'node.exe' : 'node';

export const DEFAULT_STORAGE_PATH = path.join(home(), '.nir');
export const DEFAULT_STORAGE_PATHS = createStoragePaths(DEFAULT_STORAGE_PATH);

export const EXTENSIONS_COMPRESSED = ['.gz', '.zip', '.xz', '.7z'];

export const NODE_DIST_BASE_URL = 'https://nodejs.org/dist';
export const NODE_SCHEDULES_URL = 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json';

export const NPM_DIST_URL = 'https://registry.npmjs.org/npm';
export const NPM_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/npm/dist-tags';
export const NPM_MIN_VERSION = 3;
export const NPM_PLATFORM_FILES = {
  win32: [
    { src: path.join('node_modules', 'npm', 'bin', 'npm'), dest: 'npm' },
    { src: path.join('node_modules', 'npm', 'bin', 'npm.cmd'), dest: 'npm.cmd' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx'), dest: 'npx', optional: true },
    { src: path.join('node_modules', 'npm', 'bin', 'npx.cmd'), dest: 'npx.cmd', optional: true },
  ],
  posix: [
    { src: path.join('node_modules', 'npm', 'bin', 'npm-cli.js'), dest: 'npm' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx-cli.js'), dest: 'npx', optional: true },
  ],
};
