import assert from 'assert';

import searchList from '../../../src/installNode/searchList.ts';
import type { ResolvedInstallOptions } from '../../../src/types.ts';

const MUSL_VERSION = 'v24.20.0'; // the oldest version with a linux-x64-musl build
const GLIBC_ONLY_VERSION = 'v22.23.2';

function options(overrides: Partial<ResolvedInstallOptions>): ResolvedInstallOptions {
  return { cachePath: '', buildPath: '', installPath: '', ...overrides } as ResolvedInstallOptions;
}

const LINUX_X64 = options({ platform: 'linux', arch: 'x64' });

describe('installNode/searchList', () => {
  it('musl host, v24: musl first, then glibc', () => {
    const filenames = searchList(MUSL_VERSION, LINUX_X64, true);
    assert.equal(filenames[0], 'linux-x64-musl');
    assert.equal(filenames[1], 'linux-x64');
  });

  it('musl host, v26: musl first', () => {
    assert.equal(searchList('v26.8.1', LINUX_X64, true)[0], 'linux-x64-musl');
  });

  it('musl host, v22: no musl build exists', () => {
    const filenames = searchList(GLIBC_ONLY_VERSION, LINUX_X64, true);
    assert.equal(filenames.indexOf('linux-x64-musl'), -1);
    assert.equal(filenames[0], 'linux-x64');
  });

  it('glibc host, v24: no musl entry', () => {
    const filenames = searchList(MUSL_VERSION, LINUX_X64, false);
    assert.equal(filenames.indexOf('linux-x64-musl'), -1);
    assert.equal(filenames[0], 'linux-x64');
  });

  it('musl host, arm64: no musl build exists', () => {
    const filenames = searchList(MUSL_VERSION, options({ platform: 'linux', arch: 'arm64' }), true);
    assert.equal(filenames.indexOf('linux-arm64-musl'), -1);
    assert.equal(filenames[0], 'linux-arm64');
  });

  it('musl host, cross-installing another platform: no musl entry', () => {
    const filenames = searchList(MUSL_VERSION, options({ platform: 'darwin', arch: 'x64' }), true);
    assert.equal(filenames.indexOf('osx-x64-musl'), -1);
    assert.equal(filenames[0], 'osx-x64');
  });

  it('the musl entry carries the same suffix as the rest', () => {
    const filenames = searchList(MUSL_VERSION, options({ platform: 'linux', arch: 'x64', type: 'tar' }), true);
    assert.equal(filenames[0], 'linux-x64-musl-tar');
    assert.equal(filenames[1], 'linux-x64-tar');
  });

  it('the musl entry is the only difference from the glibc list', () => {
    const musl = searchList(MUSL_VERSION, LINUX_X64, true);
    const glibc = searchList(MUSL_VERSION, LINUX_X64, false);
    assert.deepEqual(musl, ['linux-x64-musl'].concat(glibc));
  });

  it('an explicit filename is untouched', () => {
    const explicit = options({ platform: 'linux', arch: 'x64', filename: 'linux-x64' });
    assert.deepEqual(searchList(MUSL_VERSION, explicit, true), ['linux-x64']);
    assert.deepEqual(searchList(MUSL_VERSION, explicit, false), ['linux-x64']);
  });
});
