/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { exec } from 'child_process';

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));
const reporter = './test/fixture/customMochaReporter';
const test = path.join(fixtureDir, 'simple/simple.js');

describe('cli --reporter', function () {
  it('uses spec reporter', function (done) {
    exec(`node ${binPath}  --reporter spec "${test}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, '1 passing');
      done();
    });
  });

  it('uses custom reporter', function (done) {
    exec(`node ${binPath}  --reporter "${reporter}" "${test}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, 'customMochaReporter started');
      assert.include(stdout, 'customMochaReporter finished');
      done();
    });
  });
});
