/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { exec } from 'child_process';

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));
const test = path.join(fixtureDir, 'simple/simple.js');

describe('cli --interactive', function () {
  it('just runs', function (done) {
    exec(`node ${binPath} --mode development --interactive "${test}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, '1 passing');
      done();
    });
  });
});
