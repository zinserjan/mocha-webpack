/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { exec } from './util/childProcess';

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));
const test = path.join(fixtureDir, 'simple/simple.js');

describe('cli --quiet', function () {
  it('shows info messages when not set', function (done) {
    exec(`node ${binPath} --mode development "${test}"`, (err, output) => {
      assert.isNull(err);
      assert.include(output, 'WEBPACK  Compiling...');
      done();
    });
  });

  it('does not show info messages', function (done) {
    exec(`node ${binPath} --mode development --quiet "${test}"`, (err, output) => {
      assert.isNull(err);
      assert.notInclude(output, 'WEBPACK');
      assert.notInclude(output, 'MOCHA');
      assert.notInclude(output, 'successfully');
      done();
    });
  });

  it('still shows mocha output', function (done) {
    exec(`node ${binPath} --mode development --quiet "${test}"`, (err, output) => {
      assert.isNull(err);
      assert.include(output, '1 passing');
      done();
    });
  });
});
