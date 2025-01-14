// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import path from 'path';
import url from 'url';
import cr from 'cr';
import isVersion from 'is-version';
import rimraf2 from 'rimraf2';

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

import resolveVersions from 'node-resolve-versions';
const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' });
// VERSIONS.splice(0, VERSIONS.length, 'v0.8.28')
const TARGETS = [{}] as Array<Target>;

const PLATFORMS = ['win32', 'darwin', 'linux'] as Array<NodeJS.Platform>;
PLATFORMS.forEach((platform) => TARGETS.push({ platform, arch: 'x64' }));

import values from 'lodash.values';
// TARGETS.splice(0, TARGETS.length, { filename: 'osx-x64-tar'})
const FILE_PLATFORM_MAP = {
  win: 'win32',
  osx: 'darwin',
};

import spawn from 'cross-spawn-cb';
import { spawnOptions } from 'node-version-utils';
import validate from '../lib/validate';

// @ts-ignore
import install from 'node-install-release';

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
      spawn('npm', ['--version'], spawnOptions(installPath, { silent: true, encoding: 'utf8' }), (err, res) => {
        if (err) return done(err);
        const lines = cr(res.stdout).split('\n');
        const resultVersion = lines.slice(-2, -1)[0];
        assert.ok(isVersion(resultVersion));
        done();
      });
    });

    it('node --version', (done) => {
      spawn(NODE, ['--version'], spawnOptions(installPath, { silent: true, encoding: 'utf8' }), (err, res) => {
        if (err) return done(err);
        const lines = cr(res.stdout).split('\n');
        assert.equal(lines.slice(-2, -1)[0], version);
        done();
      });
    });
  });
}

describe('callback', () => {
  after((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  describe('matrix', () => {
    before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));
    VERSIONS.forEach((version) => {
      TARGETS.forEach((target) => addTests(version, target));
      dists
        .find((dist) => dist.version === version)
        .files.filter((x) => !SKIPS.find((s) => x.indexOf(s) >= 0))
        .forEach((filename) => addTests(version, { filename }));
    });
  });
});
