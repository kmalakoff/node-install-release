import assert from 'assert';
import install, { createResult, createStoragePaths, isMusl } from 'node-install-release';

describe('exports .ts', () => {
  it('default', () => {
    assert.equal(typeof install, 'function');
  });
  it('createResult', () => {
    assert.equal(typeof createResult, 'function');
  });
  it('createStoragePaths', () => {
    assert.equal(typeof createStoragePaths, 'function');
  });
  it('isMusl', () => {
    assert.equal(typeof isMusl, 'function');
  });
});
