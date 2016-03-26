/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import path from 'path';
import { assert } from 'chai';
import parseConfig from '../../src/cli/parseConfig';

const configFileName = path.join(__dirname, 'fixture', 'config', 'mocha-webpack.opts');

describe('parseConfig', function () {
  it('returns empty object when not exists', function () {
    assert.deepEqual(parseConfig('missing-config-file.opts'), {});
  });

  it(`parses ${configFileName} when exists and returns options`, function () {
    const expectedResult = require(path.join(__dirname, 'fixture', 'config', 'expected.json'));
    const parsedOptions = parseConfig(configFileName);

    assert.deepEqual(parsedOptions, expectedResult);
  });
});
