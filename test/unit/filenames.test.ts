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
const NEWEST_VERSION = VERSIONS[VERSIONS.length - 1];
VERSIONS.splice(0, VERSIONS.length, VERSIONS[0]); // TEST SIMPLIFICATION
const TARGETS = [{}] as Target[];

// const PLATFORMS = ['win32', 'darwin', 'linux'] as NodeJS.Platform[];
const PLATFORMS = ['win32', 'linux'] as NodeJS.Platform[];
PLATFORMS.forEach((platform) => {
  TARGETS.push({ platform, arch: 'x64' });
});

// nodejs.org ships a musl build for linux-x64 only, from v24.20.0 and v26.8.0 up
const MUSL_MIN_MAJOR = 24;
const MUSL_TARGET = { filename: 'linux-x64-musl' } as Target;

import spawn from 'cross-spawn-cb';
import values from 'lodash.values';
import install, { isMusl } from 'node-install-release';
import { spawnOptions } from 'node-version-utils';
import getTarget from '../../src/lib/getTarget.ts';
import installsMusl from '../lib/installsMusl.ts';
import validate from '../lib/validate.ts';

function addTests(version: string, target: Target) {
  const specifier = (values(target) as string[]).join('-') || 'local';
  const resolved = getTarget(target);
  const platform = resolved.platform;
  // the running node's arch, not the CPU's, for a target that names neither: a Rosetta node reports x64 and execs an x64 install
  const arch = target.filename || target.arch ? resolved.arch : (process.arch as NodeJS.Architecture);

  describe(`${version}-${specifier}`, () => {
    let installPath: string | null = null;
    it('install', (done) => {
      if (specifier === 'src') {
        console.log('Skipping src');
        return done();
      }

      install(version, { name: `${version}-${specifier}`, ...OPTIONS, ...target }, (err, res) => {
        if (err) return done(err);
        if (res) installPath = res.installPath;
        if (res) version = res.version;
        assert.ok(installPath, 'install spec must run first');
        validate(installPath, target);
        done();
      });
    });

    // skipped or not runnable locally: a glibc binary cannot exec on a musl host, nor a musl one on glibc
    if (platform !== process.platform || arch !== process.arch || specifier === 'src') return;
    if (installsMusl(version, target) !== isMusl()) return;

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

describe('filenames', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  describe('matrix', () => {
    VERSIONS.forEach((version) => {
      TARGETS.forEach((target) => {
        addTests(version, target);
      });
    });
    if (parseInt(NEWEST_VERSION.replace(/^v/, ''), 10) >= MUSL_MIN_MAJOR) addTests(NEWEST_VERSION, MUSL_TARGET);
    addTests(NEWEST_VERSION, {});
  });
});
