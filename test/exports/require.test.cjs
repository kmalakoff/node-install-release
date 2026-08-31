const assert = require('assert');
const install = require('node-install-release');

describe('exports .cjs', () => {
  it('default', () => {
    assert.equal(typeof install, 'function');
  });
  it('createResult', () => {
    assert.equal(typeof install.createResult, 'function');
  });
  it('createStoragePaths', () => {
    assert.equal(typeof install.createStoragePaths, 'function');
  });
});
