import assert from 'assert';
import install, { createResult, createStoragePaths } from 'node-install-release';

describe('exports .mjs', () => {
  it('default', () => {
    assert.equal(typeof install, 'function');
  });
  it('createResult', () => {
    assert.equal(typeof createResult, 'function');
  });
  it('createStoragePaths', () => {
    assert.equal(typeof createStoragePaths, 'function');
  });
});
