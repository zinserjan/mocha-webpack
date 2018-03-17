/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { exec } from './util/childProcess';

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));
const testBdd = path.join(fixtureDir, 'ui/bdd.js');
const testTdd = path.join(fixtureDir, 'ui/tdd.js');
const testBddLazy = path.join(fixtureDir, 'ui/bdd-lazy-var.js');

describe('cli --ui', function () {
  it('uses bdd as default', function (done) {
    exec(`node ${binPath} --mode development "${testBdd}"`, (err, output) => {
      assert.isNull(err);
      assert.include(output, '1 passing');
      done();
    });
  });

  it('uses tdd', function (done) {
    exec(`node ${binPath} --mode development --ui tdd "${testTdd}"`, (err, output) => {
      assert.isNull(err);
      assert.include(output, '1 passing');
      done();
    });
  });

  it('uses bdd-lazy-var', function (done) {
    exec(`node ${binPath} --mode development --ui bdd-lazy-var/getter "${testBddLazy}"`, (err, output) => {
      assert.isNull(err);
      assert.include(output, '1 passing');
      done();
    });
  });
});
