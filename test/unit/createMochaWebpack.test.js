/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import { assert } from 'chai';
import MochaWebpack from '../../src/MochaWebpack';
import createMochaWebpack from '../../src/createMochaWebpack';

describe('createMochaWebpack', function () {
  it('should create a instance of MochaWebpack', function () {
    assert.doesNotThrow(() => createMochaWebpack());
    const mochaWebpack = createMochaWebpack();

    assert.isNotNull(mochaWebpack);
    assert.instanceOf(mochaWebpack, MochaWebpack);
  });
});
