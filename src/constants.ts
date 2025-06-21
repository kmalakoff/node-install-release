import home from 'homedir-polyfill';
import keys from 'lodash.keys';
import path from 'path';
// @ts-ignore
import files from '../../assets/files.cjs';
import createStoragePaths from './createStoragePaths.ts';

export const FILES = files;
export const DEFAULT_STORAGE_PATH = path.join(home(), '.nir');
export const DEFAULT_STORAGE_PATHS = createStoragePaths(DEFAULT_STORAGE_PATH);

export const FILE_PLATFORMS = keys(FILES).filter((file) => ['src', 'headers'].indexOf(file) < 0);

export const FILE_PLATFORM_MAP = {
  win: 'win32',
  win32: 'win',
  osx: 'darwin',
  darwin: 'osx',
};

export const EXTENSIONS_COMPRESSED = ['.gz', '.zip', '.xz', '.7z'];

export const NODE_FILE_PATHS = {
  win32: 'node.exe',
  posix: path.join('bin', 'node'),
};
export const NODE_DIST_BASE_URL = 'https://nodejs.org/dist';
export const NODE_SCHEDULES_URL = 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json';

export const NPM_DIST_URL = 'https://registry.npmjs.org/npm';
export const NPM_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/npm/dist-tags';
export const NPM_MIN_VERSION = 3;
export const NPM_FILE_PATHS = {
  win32: [
    { src: path.join('node_modules', 'npm', 'bin', 'npm'), dest: 'npm' },
    { src: path.join('node_modules', 'npm', 'bin', 'npm.cmd'), dest: 'npm.cmd' },
    { src: path.join('node_modules', 'npm', 'bin', 'npx'), dest: 'npx', optional: true },
    { src: path.join('node_modules', 'npm', 'bin', 'npx.cmd'), dest: 'npx.cmd', optional: true },
  ],
  posix: [
    { src: path.join('lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'), dest: path.join('bin', 'npm') },
    { src: path.join('lib', 'node_modules', 'npm', 'bin', 'npx-cli.js'), dest: path.join('bin', 'npx'), optional: true },
  ],
};
