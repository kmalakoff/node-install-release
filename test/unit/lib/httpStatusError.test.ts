import assert from 'assert';
import httpStatusError from '../../../src/lib/httpStatusError.ts';

const ENDPOINT = 'https://nodejs.org/dist/v0.0.0/SHASUMS256.txt';

describe('lib/httpStatusError', () => {
  it('200 is success', () => {
    assert.equal(httpStatusError(ENDPOINT, 200), null);
  });

  it('206 is success', () => {
    assert.equal(httpStatusError(ENDPOINT, 206), null);
  });

  it('404 names the code and the endpoint', () => {
    const err = httpStatusError(ENDPOINT, 404);
    assert.ok(err);
    assert.equal(err?.statusCode, 404);
    assert.equal(err?.message, `HTTP 404 ${ENDPOINT}`);
  });

  it('429 names the code and the endpoint', () => {
    const err = httpStatusError(ENDPOINT, 429);
    assert.ok(err);
    assert.equal(err?.statusCode, 429);
    assert.equal(err?.message, `HTTP 429 ${ENDPOINT}`);
  });

  it('500 names the code and the endpoint', () => {
    const err = httpStatusError(ENDPOINT, 500);
    assert.ok(err);
    assert.equal(err?.statusCode, 500);
    assert.equal(err?.message, `HTTP 500 ${ENDPOINT}`);
  });

  it('an undefined status is an error', () => {
    const err = httpStatusError(ENDPOINT, undefined);
    assert.ok(err);
    assert.equal(err?.statusCode, undefined);
  });
});
