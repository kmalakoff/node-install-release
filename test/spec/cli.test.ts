// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import cr from 'cr';
import isVersion from 'is-version';
import path from 'path';
import rimraf2 from 'rimraf2';
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

const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' });
VERSIONS.splice(0, VERSIONS.length, VERSIONS[0], VERSIONS[VERSIONS.length - 1]); // TEST SIMPLIFICATIOn

import spawn from 'cross-spawn-cb';
import { spawnOptions } from 'node-version-utils';
import validate from '../lib/validate';

const CLI = path.join(__dirname, '..', '..', 'bin', 'cli.cjs');

function addTests(version) {
  let installPath = null;

  describe(version, () => {
    it('install', (done) => {
      installPath = path.join(OPTIONS.storagePath, 'installed', version);
      const args = [version, '--installPath', installPath, '--silent'];
      keys(OPTIONS).forEach((key) => Array.prototype.push.apply(args, [`--${key}`, OPTIONS[key]]));

      spawn(CLI, args, { stdio: 'inherit' }, (err) => {
        if (err) return done(err.message);
        validate(installPath, OPTIONS);
        done();
      });
    });

    it('npm --version', (done) => {
      spawn('npm', ['--version'], spawnOptions(installPath, { silent: true, encoding: 'utf8' }), (err, res) => {
        if (err) return done(err.message);
        const lines = cr(res.stdout).split('\n');
        const resultVersion = lines.slice(-2, -1)[0];
        assert.ok(isVersion(resultVersion));
        done();
      });
    });

    it('node --version', (done) => {
      spawn(NODE, ['--version'], spawnOptions(installPath, { silent: true, encoding: 'utf8' }), (err, res) => {
        if (err) return done(err.message);
        const lines = cr(res.stdout).split('\n');
        assert.equal(lines.slice(-2, -1)[0], version);
        done();
      });
    });
  });
}

describe('cli', () => {
  before(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));
  after(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));

  describe('happy path', () => {
    for (let i = 0; i < VERSIONS.length; i++) {
      addTests(VERSIONS[i]);
    }
  });
});
