/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import path from 'path';
import { assert } from 'chai';
import parseConfig from '../../src/cli/parseConfig';

const configFileName = path.join(__dirname, 'fixture', 'config', 'mocha-webpack.opts');

describe('parseConfig', function () {
  it('returns empty object when default config file is missing', function () {
    assert.deepEqual(parseConfig(), {});
  });

  it('throws an error when explicitly-specified default config file is missing', function () {
    const fn = () => {
      parseConfig('mocha-webpack.opts');
    };

    // then
    assert.throws(fn, /Options file 'mocha-webpack.opts' not found/);
  });

  it('throws an error when specified config file is missing', function () {
    const fn = () => {
      parseConfig('missing-config.opts');
    };

    // then
    assert.throws(fn, /Options file 'missing-config.opts' not found/);
  });

  it(`parses ${configFileName} when exists and returns options`, function () {
    // eslint-disable-next-line global-require
    const expectedResult = require(path.join(__dirname, 'fixture', 'config', 'expected.json'));
    const parsedOptions = parseConfig(configFileName);

    assert.deepEqual(parsedOptions, expectedResult);
  });
});
