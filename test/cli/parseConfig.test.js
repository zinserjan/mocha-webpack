/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import fs from 'fs';
import path from 'path';
import { assert } from 'chai';
import { stub } from 'sinon';
import parseConfig from '../../src/cli/parseConfig';

const configFileName = 'mochawebpack.opts';

describe('parseConfig', function () {
  it('returns empty object when not exists', function () {
    assert.doesNotThrow(parseConfig);
    assert.deepEqual(parseConfig(), {});
  });

  it(`parses ${configFileName} when exists and returns options`, function () {
    const existsFileSyncMock = stub().returns(true);
    const givenRc = fs.readFileSync(path.join(__dirname, 'fixture', 'config', configFileName), 'utf8');
    const expectedResult = require(path.join(__dirname, 'fixture', 'config', 'expected.json'));
    const readFileSyncMock = stub().returns(givenRc);

    parseConfig.__Rewire__('existsFileSync', existsFileSyncMock);
    parseConfig.__Rewire__('fs', {
      readFileSync: readFileSyncMock,
    });

    assert.doesNotThrow(parseConfig);

    assert.isOk(existsFileSyncMock.calledWithExactly(configFileName));
    assert.isOk(readFileSyncMock.calledWithExactly(configFileName, 'utf8'));

    const parsedOptions = parseConfig();

    assert.deepEqual(parsedOptions, expectedResult);

    parseConfig.__ResetDependency__('existsFileSync');
    parseConfig.__ResetDependency__('fs');
  });
});
