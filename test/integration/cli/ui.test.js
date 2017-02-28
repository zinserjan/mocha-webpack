/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { exec } from 'child_process';

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));
const testBdd = path.join(fixtureDir, 'ui/bdd.js');
const testTdd = path.join(fixtureDir, 'ui/tdd.js');
const testBddLazy = path.join(fixtureDir, 'ui/bdd-lazy-var.js');

describe('cli --ui', function () {
  it('uses bdd as default', function (done) {
    exec(`node ${binPath}  "${testBdd}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, '1 passing');
      done();
    });
  });

  it('uses tdd', function (done) {
    exec(`node ${binPath}  --ui tdd "${testTdd}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, '1 passing');
      done();
    });
  });

  it('uses bdd-lazy-va', function (done) {
    exec(`node ${binPath}  --ui bdd-lazy-var/getter "${testBddLazy}"`, (err, stdout) => {
      assert.isNull(err);
      assert.include(stdout, '1 passing');
      done();
    });
  });
});
