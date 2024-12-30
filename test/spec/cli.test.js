// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const crossSpawn = require('cross-spawn-cb');

const validateInstall = require('../lib/validateInstall');

const CLI = path.join(__dirname, '..', '..', 'bin', 'cli.js');
const TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  cachePath: path.join(TMP_DIR, 'cache'),
  buildPath: path.join(TMP_DIR, 'build'),
};
const VERSIONS = ['v12'];
const TARGETS = [{}];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';

  it(`${version} (${platform},${arch})`, (done) => {
    const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
    let args = [version, installPath, '--cachePath', OPTIONS.cachePath, '--silent'];
    if (platform !== 'local') args = args.concat(['--platform', platform]);
    if (arch !== 'local') args = args.concat(['--arch', arch]);

    crossSpawn(CLI, args, { stdio: 'inherit' }, (err, _res) => {
      assert.ok(!err, err ? err.message : '');
      validateInstall(version, installPath, target, done);
    });
  });
}

describe('cli', () => {
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  describe('happy path', () => {
    for (let i = 0; i < VERSIONS.length; i++) {
      for (let j = 0; j < TARGETS.length; j++) {
        addTests(VERSIONS[i], TARGETS[j]);
      }
    }
  });

  describe('unhappy path', () => {});
});
