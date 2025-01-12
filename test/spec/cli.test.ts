// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import path from 'path';
import url from 'url';
import crossSpawn from 'cross-spawn-cb';
import rimraf2 from 'rimraf2';

import validateInstall from '../lib/validateInstall';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const CLI = path.join(__dirname, '..', '..', 'bin', 'cli.cjs');
const TMP_DIR = path.join(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  storagePath: TMP_DIR,
};
const VERSIONS = ['v12.22.12'];
const TARGETS = [{}];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';
  target = { platform, arch };

  it(`${version} (${platform},${arch})`, (done) => {
    const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
    const args = [version, '--installPath', installPath, '--storagePath', OPTIONS.storagePath, '--silent'];
    Array.prototype.push.apply(args, ['--platform', platform === 'local' ? process.platform : platform]);
    Array.prototype.push.apply(args, ['--arch', arch === 'local' ? process.arch : arch]);

    crossSpawn(CLI, args, { stdio: 'inherit' }, (err) => {
      if (err) return done(err);
      validateInstall(version, installPath, target, done);
    });
  });
}

describe('cli', () => {
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));
  // after((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  describe('happy path', () => {
    for (let i = 0; i < VERSIONS.length; i++) {
      for (let j = 0; j < TARGETS.length; j++) {
        addTests(VERSIONS[i], TARGETS[j]);
      }
    }
  });

  describe('unhappy path', () => {});
});
