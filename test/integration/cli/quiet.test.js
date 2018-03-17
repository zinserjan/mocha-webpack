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
    exec(`node ${binPath} --mode development "${test}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, 'WEBPACK  Compiling...');
      done();
    });
  });

  it('does not show info messages', function (done) {
    exec(`node ${binPath} --mode development --quiet "${test}"`, (err, stdout) => {
      assert.isNull(err);
      assert.notInclude(stdout, 'WEBPACK');
      assert.notInclude(stdout, 'MOCHA');
      assert.notInclude(stdout, 'successfully');
      done();
    });
  });

  it('still shows mocha output', function (done) {
    exec(`node ${binPath} --mode development --quiet "${test}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, '1 passing');
      done();
    });
  });
});
