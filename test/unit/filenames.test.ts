// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import cr from 'cr';
import isVersion from 'is-version';
import find from 'lodash.find';
import path from 'path';
import rimraf2 from 'rimraf2';
import url from 'url';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const NODE = isWindows ? 'node.exe' : 'node';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(path.join(__dirname, '..', '..', '.tmp'));
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
};

import { getDists } from 'node-filename-to-dist-paths';

const dists = getDists();
const SKIPS = ['headers', '-msi', '-pkg'];

interface Target {
  filename?: string;
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
}

import * as resolveVersions from 'node-resolve-versions';

const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' });
VERSIONS.splice(0, VERSIONS.length, VERSIONS[0], VERSIONS[VERSIONS.length - 1]); // TEST SIMPLIFICATIOn
const TARGETS = [{}] as Target[];

const PLATFORMS = ['win32', 'darwin', 'linux'] as NodeJS.Platform[];
PLATFORMS.forEach((platform) => TARGETS.push({ platform, arch: 'x64' }));

import values from 'lodash.values';

// TARGETS.splice(0, TARGETS.length, { filename: 'osx-x64-tar'})
const FILE_PLATFORM_MAP = {
  win: 'win32',
  osx: 'darwin',
};

import spawn from 'cross-spawn-cb';
// @ts-ignore
import install from 'node-install-release';
import { spawnOptions } from 'node-version-utils';
import validate from '../lib/validate.ts';

function addTests(version, target) {
  const specifier = values(target).join('-') || 'local';
  let { filename, platform, arch } = target;
  if (filename) {
    const filePlatform = filename.split('-')[0];
    platform = ['headers', 'src'].indexOf(filePlatform) >= 0 ? process.platform : FILE_PLATFORM_MAP[filePlatform] || filePlatform;
    arch = filename.split('-')[1];
  }
  if (!platform) platform = process.platform;
  if (!arch) arch = process.arch;

  describe(`${version}-${specifier}`, () => {
    let installPath = null;
    it('install', (done) => {
      if (specifier === 'src') {
        console.log('Skipping src');
        return done();
      }

      install(version, { name: `${version}-${specifier}`, ...OPTIONS, ...target }, (err, res) => {
        if (err) return err.message.indexOf('Failed to find installable') >= 0 ? done() : done(err);
        if (res) installPath = res.installPath;
        if (res) version = res.version;
        validate(installPath, target);
        done();
      });
    });

    // skipped or not runnable locally
    if (platform !== process.platform || arch !== process.arch || specifier === 'src') return;

    it('npm --version', (done) => {
      if (!installPath) return done(); // failed to install
      spawn('npm', ['--version'], spawnOptions(installPath, { encoding: 'utf8' }), (err, res) => {
        if (err) return done(err.message);
        const lines = cr(res.stdout).split('\n');
        const resultVersion = lines.slice(-2, -1)[0];
        assert.ok(isVersion(resultVersion));
        done();
      });
    });

    it('node --version', (done) => {
      if (!installPath) return done(); // failed to install
      spawn(NODE, ['--version'], spawnOptions(installPath, { encoding: 'utf8' }), (err, res) => {
        if (err) return done(err.message);
        const lines = cr(res.stdout).split('\n');
        assert.equal(lines.slice(-2, -1)[0], version);
        done();
      });
    });
  });
}

describe('filenames', () => {
  before(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));
  after(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));

  describe('matrix', () => {
    VERSIONS.forEach((version) => {
      TARGETS.forEach((target) => addTests(version, target));
      find(dists, (dist) => dist.version === version)
        .files.filter((x) => !find(SKIPS, (s) => x.indexOf(s) >= 0))
        .forEach((filename) => addTests(version, { filename }));
    });
  });
});
