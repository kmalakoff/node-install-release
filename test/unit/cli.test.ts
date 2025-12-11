// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import cr from 'cr';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import path from 'path';
import url from 'url';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const NODE = isWindows ? 'node.exe' : 'node';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(path.join(__dirname, '..', '..', '.tmp'));
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
  platform: process.platform,
  arch: 'x64' as NodeJS.Architecture,
};

import keys from 'lodash.keys';
import * as resolveVersions from 'node-resolve-versions';

const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' }) as string[];
VERSIONS.splice(0, VERSIONS.length, VERSIONS[0], VERSIONS[VERSIONS.length - 1]); // TEST SIMPLIFICATIOn

import spawn from 'cross-spawn-cb';
import { spawnOptions } from 'node-version-utils';
import validate from '../lib/validate.ts';

const CLI = path.join(__dirname, '..', '..', 'bin', 'cli.js');
const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));

function addTests(version) {
  let installPath = null;

  describe(version, () => {
    it('install', (done) => {
      installPath = path.join(OPTIONS.storagePath, 'installed', version);
      const args = [version, '--installPath', installPath, '--silent'];
      keys(OPTIONS).forEach((key) => {
        Array.prototype.push.apply(args, [`--${key}`, OPTIONS[key]]);
      });

      spawn(CLI, args, { stdio: 'inherit' }, (err) => {
        if (err) {
          done(err);
          return;
        }
        validate(installPath, OPTIONS);
        done();
      });
    });

    it('npm --version', (done) => {
      spawn('npm', ['--version'], spawnOptions(installPath, { encoding: 'utf8' }), (err, res) => {
        if (err) {
          done(err);
          return;
        }
        const lines = cr(res.stdout).split('\n');
        const resultVersion = lines.slice(-2, -1)[0];
        assert.ok(isVersion(resultVersion));
        done();
      });
    });

    it('node --version', (done) => {
      spawn(NODE, ['--version'], spawnOptions(installPath, { encoding: 'utf8' }), (err, res) => {
        if (err) {
          done(err);
          return;
        }
        const lines = cr(res.stdout).split('\n');
        assert.equal(lines.slice(-2, -1)[0], version);
        done();
      });
    });
  });
}

describe('cli', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  describe('--version', () => {
    it('outputs version with --version', (done) => {
      spawn(CLI, ['--version'], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err);
        const output = cr(res.stdout).trim();
        assert.equal(output, PACKAGE_JSON.version);
        done();
      });
    });

    it('outputs version with -v', (done) => {
      spawn(CLI, ['-v'], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err);
        const output = cr(res.stdout).trim();
        assert.equal(output, PACKAGE_JSON.version);
        done();
      });
    });
  });

  describe('--help', () => {
    it('outputs help with --help', (done) => {
      spawn(CLI, ['--help'], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err);
        const output = cr(res.stdout);
        assert.ok(output.indexOf('Usage:') >= 0, 'Help output should contain Usage:');
        assert.ok(output.indexOf('--version') >= 0, 'Help output should contain --version');
        assert.ok(output.indexOf('--help') >= 0, 'Help output should contain --help');
        assert.ok(output.indexOf(PACKAGE_JSON.version) >= 0, 'Help output should contain version');
        done();
      });
    });

    it('outputs help with -h', (done) => {
      spawn(CLI, ['-h'], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err);
        const output = cr(res.stdout);
        assert.ok(output.indexOf('Usage:') >= 0, 'Help output should contain Usage:');
        done();
      });
    });
  });

  describe('happy path', () => {
    for (let i = 0; i < VERSIONS.length; i++) {
      addTests(VERSIONS[i]);
    }
  });
});
