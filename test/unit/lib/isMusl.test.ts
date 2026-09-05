import assert from 'assert';
import fs from 'fs';

import isMusl, { isMuslHeader, isMuslLib } from '../../../src/lib/isMusl.ts';

describe('lib/isMusl', () => {
  describe('isMuslHeader', () => {
    it('a header with glibcVersionRuntime is glibc', () => {
      assert.equal(isMuslHeader({ glibcVersionRuntime: '2.36' }), false);
    });

    it('a header without glibcVersionRuntime is musl', () => {
      assert.equal(isMuslHeader({}), true);
    });

    it('no header is no evidence', () => {
      assert.equal(isMuslHeader(null), false);
    });
  });

  describe('isMuslLib', () => {
    it('finds the musl loader in a listing', () => {
      assert.equal(isMuslLib(['libc.musl-x86_64.so.1', 'ld-musl-x86_64.so.1']), true);
    });

    it('a glibc listing has no musl loader', () => {
      assert.equal(isMuslLib(['ld-linux-x86-64.so.2', 'libc.so.6']), false);
    });

    it('an empty listing has no musl loader', () => {
      assert.equal(isMuslLib([]), false);
    });
  });

  describe('isMusl', () => {
    it('is false off linux', () => {
      if (process.platform === 'linux') return; // the host libc decides there
      assert.equal(isMusl(), false);
    });

    it('agrees with a musl loader in /lib', () => {
      if (process.platform !== 'linux') return;
      let files: string[] = [];
      try {
        files = fs.readdirSync('/lib');
      } catch (_err) {
        return; // no readable /lib to cross-check against
      }
      if (!isMuslLib(files)) return; // a glibc distro can keep its loader elsewhere, so it proves nothing
      assert.equal(isMusl(), true);
    });
  });
});
