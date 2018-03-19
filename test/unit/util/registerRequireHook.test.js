/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import { assert } from 'chai';
import registerRequireHook from '../../../src/util/registerRequireHook';

import fakemodule from './fixture/fakeModule';
const fakeModulePath = require.resolve('./fixture/fakeModule');

describe('registerRequireHook', function () {
  beforeEach(function () {
    delete require.cache[fakeModulePath];
  });

  it('requires from disk', function () {
    const result = require(fakeModulePath); // eslint-disable-line global-require
    assert.equal(result, fakemodule);
  });

  it('requires from memory', function () {
    const dispose = registerRequireHook('.js', (filePath, requireCaller) => {
      if (filePath === fakeModulePath) {
        const { filename } = requireCaller;
        assert.equal(filename, __filename);
        return { path: filePath, source: 'module.exports = "from-memory";' };
      }
      return { path: null, source: null };
    });

    // module should be read from memory
    const resultMemory = require(fakeModulePath); // eslint-disable-line global-require
    assert.notEqual(resultMemory, fakemodule);

    // unregister memory require handler
    dispose();

    // module should be read from disk
    const resultDisk = require(fakeModulePath); // eslint-disable-line global-require
    assert.equal(resultDisk, fakemodule);
  });
});
