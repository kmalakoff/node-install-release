// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import cr from 'cr';
import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import path from 'path';
import url from 'url';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE ?? '');
const NODE = isWindows ? 'node.exe' : 'node';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(path.join(__dirname, '..', '..', '.tmp'));
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
};

import { getDists } from 'node-filename-to-dist-paths';

const _dists = getDists();
const _SKIPS = ['headers', '-msi', '-pkg'];

interface Target {
  filename?: string;
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
}

import * as resolveVersions from 'node-resolve-versions';

const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' }) as string[];
VERSIONS.splice(0, VERSIONS.length, VERSIONS[0]); // TEST SIMPLIFICATION
const TARGETS = [{}] as Target[];

// const PLATFORMS = ['win32', 'darwin', 'linux'] as NodeJS.Platform[];
const PLATFORMS = ['win32'] as NodeJS.Platform[];
PLATFORMS.forEach((platform) => {
  TARGETS.push({ platform, arch: 'x64' });
});

import values from 'lodash.values';

// TARGETS.splice(0, TARGETS.length, { filename: 'osx-x64-tar'})
const FILE_PLATFORM_MAP: Record<string, string> = {
  win: 'win32',
  osx: 'darwin',
};

import spawn from 'cross-spawn-cb';
import install from 'node-install-release';
import { spawnOptions } from 'node-version-utils';
import validate from '../lib/validate.ts';

function addTests(version: string, target: Target) {
  const specifier = (values(target) as string[]).join('-') || 'local';
  let { filename, platform, arch } = target;
  if (filename) {
    const filePlatform = filename.split('-')[0];
    platform = (['headers', 'src'].indexOf(filePlatform) >= 0 ? process.platform : FILE_PLATFORM_MAP[filePlatform] || filePlatform) as NodeJS.Platform;
    arch = filename.split('-')[1] as NodeJS.Architecture;
  }
  if (!platform) platform = process.platform;
  if (!arch) arch = process.arch as NodeJS.Architecture;

  describe(`${version}-${specifier}`, () => {
    let installPath: string | null = null;
    it('install', (done) => {
      if (specifier === 'src') {
        console.log('Skipping src');
        return done();
      }

      install(version, { name: `${version}-${specifier}`, ...OPTIONS, ...target }, (err, res) => {
        if (err) return err.message.indexOf('Failed to find installable') >= 0 ? done() : done(err);
        if (res) installPath = res.installPath;
        if (res) version = res.version;
        validate(installPath!, target);
        done();
      });
    });

    // skipped or not runnable locally
    if (platform !== process.platform || arch !== process.arch || specifier === 'src') return;

    it('npm --version', (done) => {
      if (!installPath) return done(); // failed to install
      spawn('npm', ['--version'], spawnOptions(installPath, { encoding: 'utf8' }), (err, res) => {
        if (err) return done(err);
        if (!res) {
          done(new Error('No response'));
          return;
        }
        const lines = cr(res.stdout).split('\n');
        const resultVersion = lines.slice(-2, -1)[0];
        assert.ok(isVersion(resultVersion));
        done();
      });
    });

    it('node --version', (done) => {
      if (!installPath) return done(); // failed to install
      spawn(NODE, ['--version'], spawnOptions(installPath, { encoding: 'utf8' }), (err, res) => {
        if (err) return done(err);
        if (!res) {
          done(new Error('No response'));
          return;
        }
        const lines = cr(res.stdout).split('\n');
        assert.equal(lines.slice(-2, -1)[0], version);
        done();
      });
    });
  });
}

describe.only('filenames', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  describe('matrix', () => {
    VERSIONS.forEach((version) => {
      TARGETS.forEach((target) => {
        addTests(version, target);
      });
    });
  });
});
