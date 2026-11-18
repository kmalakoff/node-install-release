// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import mkdirp from 'mkdirp-classic';
import install, { isMusl } from 'node-install-release';
import path from 'path';
import url from 'url';
import installsMusl from '../lib/installsMusl.ts';
import validate from '../lib/validate.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const TMP_DIR = path.join(ROOT, '.tmp', 'installStaged');
// release tarballs are named by version and verified against nodejs.org's SHASUMS256.txt, then never change: safe to share between worktrees
const CACHE_PATH = path.join(ROOT, '.cache', 'shared', 'node-install-release');
const VERSION = 'v0.8.28';
const INSTALL_PATH = path.join(TMP_DIR, 'installed', VERSION);
const OPTIONS = {
  storagePath: TMP_DIR,
  cachePath: CACHE_PATH,
  installPath: INSTALL_PATH,
  platform: process.platform,
  arch: 'x64' as NodeJS.Architecture,
};

// the same guard the cli test uses: a glibc build is not installed on a musl host, and no musl build exists for this version
if (installsMusl(VERSION, OPTIONS) === isMusl()) {
  describe('install is staged', () => {
    before((cb) => safeRm(TMP_DIR, cb));
    after((cb) => safeRm(TMP_DIR, cb));

    const reset = (cb: (err?: Error | null) => void) =>
      safeRm(path.join(TMP_DIR, 'installed'), (err) => {
        if (err) return cb(err);
        mkdirp.sync(path.dirname(INSTALL_PATH));
        cb();
      });

    // the install must fail naming the path and leave whatever is there exactly as it was
    function refuses(snapshot: () => unknown, done: (err?: Error) => void) {
      const expected = snapshot();
      install(VERSION, OPTIONS, (err) => {
        try {
          assert.ok(err, 'expected an error');
          assert.ok(err.message.indexOf(INSTALL_PATH) >= 0, err.message);
          assert.deepEqual(snapshot(), expected);
          done();
        } catch (e) {
          done(e as Error);
        }
      });
    }
    const treeOf = (dir: string): unknown =>
      fs
        .readdirSync(dir)
        .sort()
        .map((name) => {
          const full = path.join(dir, name);
          return fs.statSync(full).isDirectory() ? [name, treeOf(full)] : [name, fs.readFileSync(full, 'utf8')];
        });
    const linkOf = (p: string): unknown => [fs.readlinkSync(p), fs.lstatSync(p).isSymbolicLink()];
    const symlinks = process.platform === 'win32' ? it.skip : it; // creating a link needs a privilege on Windows

    it('leaves a non-empty folder without node untouched and errors', (done) => {
      reset((err) => {
        if (err) return done(err);
        mkdirp.sync(path.join(INSTALL_PATH, 'sub'));
        fs.writeFileSync(path.join(INSTALL_PATH, 'keep.txt'), 'someone else');
        fs.writeFileSync(path.join(INSTALL_PATH, 'sub', 'deep.txt'), 'nested');
        refuses(() => treeOf(INSTALL_PATH), done);
      });
    });

    it('leaves a folder holding only a dotfile untouched and errors', (done) => {
      reset((err) => {
        if (err) return done(err);
        mkdirp.sync(INSTALL_PATH);
        fs.writeFileSync(path.join(INSTALL_PATH, '.keep'), 'dot');
        refuses(() => treeOf(INSTALL_PATH), done);
      });
    });

    it('leaves a regular file untouched and errors', (done) => {
      reset((err) => {
        if (err) return done(err);
        fs.writeFileSync(INSTALL_PATH, 'precious');
        fs.chmodSync(INSTALL_PATH, 0o640);
        refuses(() => [fs.readFileSync(INSTALL_PATH, 'utf8'), fs.lstatSync(INSTALL_PATH).isFile(), fs.statSync(INSTALL_PATH).mode & 0o777], done);
      });
    });

    symlinks('leaves a symlink to a file untouched and errors', (done) => {
      reset((err) => {
        if (err) return done(err);
        const target = path.join(TMP_DIR, 'target.txt');
        fs.writeFileSync(target, 'target content');
        fs.symlinkSync(target, INSTALL_PATH);
        refuses(() => [linkOf(INSTALL_PATH), fs.readFileSync(target, 'utf8')], done);
      });
    });

    symlinks('leaves a symlink to a non-empty folder untouched and errors', (done) => {
      reset((err) => {
        if (err) return done(err);
        const target = path.join(TMP_DIR, 'target-dir');
        mkdirp.sync(target);
        fs.writeFileSync(path.join(target, 'keep.txt'), 'inside');
        fs.symlinkSync(target, INSTALL_PATH, 'dir');
        refuses(() => [linkOf(INSTALL_PATH), treeOf(target)], done);
      });
    });

    symlinks('leaves a dangling symlink untouched and errors', (done) => {
      reset((err) => {
        if (err) return done(err);
        fs.symlinkSync(path.join(TMP_DIR, 'does-not-exist'), INSTALL_PATH);
        refuses(() => [linkOf(INSTALL_PATH), fs.existsSync(path.join(TMP_DIR, 'does-not-exist'))], done);
      });
    });

    // root reads any folder, and Windows has no mode bits
    const unreadable = process.platform === 'win32' || (process.getuid && process.getuid() === 0) ? it.skip : it;
    unreadable('leaves a folder it cannot read untouched and errors', (done) => {
      reset((err) => {
        if (err) return done(err);
        mkdirp.sync(INSTALL_PATH);
        fs.chmodSync(INSTALL_PATH, 0o000); // empty to us, but we cannot tell: a read error is not "empty"

        const finish = (e?: Error) => {
          fs.chmodSync(INSTALL_PATH, 0o755);
          if (e) return done(e);
          assert.deepEqual(fs.readdirSync(INSTALL_PATH), []);
          assert.equal(fs.statSync(INSTALL_PATH).mode & 0o777, 0o755);
          done();
        };
        install(VERSION, OPTIONS, (err) => {
          try {
            assert.ok(err, 'expected an error');
            assert.ok(err.message.indexOf(INSTALL_PATH) >= 0 || /EACCES/.test(err.message), err.message);
            assert.equal(fs.statSync(INSTALL_PATH).mode & 0o777, 0);
            finish();
          } catch (e) {
            finish(e as Error);
          }
        });
      });
    });

    it('installs into a missing path', (done) => {
      reset((err) => {
        if (err) return done(err);
        install(VERSION, OPTIONS, (err, result) => {
          if (err) return done(err);
          assert.equal(result?.installPath, INSTALL_PATH);
          validate(INSTALL_PATH, OPTIONS);
          done();
        });
      });
    });

    it('installs into an empty folder', (done) => {
      reset((err) => {
        if (err) return done(err);
        mkdirp.sync(INSTALL_PATH);
        install(VERSION, OPTIONS, (err, result) => {
          if (err) return done(err);
          assert.equal(result?.installPath, INSTALL_PATH);
          validate(INSTALL_PATH, OPTIONS);
          done();
        });
      });
    });

    it('keeps a complete install and does not install it again', (done) => {
      const execPath = path.join(INSTALL_PATH, process.platform === 'win32' ? 'node.exe' : path.join('bin', 'node'));
      const before = fs.statSync(execPath).mtime.getTime();
      setTimeout(() => {
        install(VERSION, OPTIONS, (err) => {
          if (err) return done(err);
          assert.equal(fs.statSync(execPath).mtime.getTime(), before);
          done();
        });
      }, 1100);
    });
  });
}
