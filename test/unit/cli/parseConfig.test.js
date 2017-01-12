/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import path from 'path';
import fs from 'fs-extra';
import { assert } from 'chai';
import parseConfig from '../../../src/cli/parseConfig';

const optsTestCasesPath = path.join(__dirname, 'fixture', 'config', 'optsTestCases');
const optsTestCases = fs.readdirSync(optsTestCasesPath);

describe.only('parseConfig', function () {
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

  optsTestCases.forEach((testDirName) => {
    const testDirPath = path.join(optsTestCasesPath, testDirName);
    const optsFilePath = path.join(testDirPath, 'mocha-webpack.opts');
    const expectedResultsPath = path.join(testDirPath, 'expected.json');

    it(`parses ${optsFilePath} and returns options`, function () {
      // eslint-disable-next-line global-require
      const expectedResult = require(expectedResultsPath);
      const parsedOptions = parseConfig(optsFilePath);

      assert.deepEqual(parsedOptions, expectedResult);
    });
  });
});
