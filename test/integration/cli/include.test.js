/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import path from 'path';
import { assert } from 'chai';
import { exec } from './util/childProcess';

const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const helperDir = path.join(fixtureDir, 'include', 'helper');
const testDir = path.join(fixtureDir, 'include', 'test');


const helper1 = `${path.join(helperDir, 'test-helper.js')}`;
const helper2 = `${path.join(helperDir, 'test-helper-2.js')}`;


function test(entry, options, cb) {
  exec(`node ${binPath} --mode development "${entry}" ${options.join(' ')}  `, cb);
}

function testInclude(entry, includes, cb) {
  const options = includes.map((value) => `--include ${value}`);
  test(entry, options, cb);
}

function testSingleInclude(entry, done) {
  return testInclude(entry, [helper1], (err, stdout) => {
    assert.isNull(err);
    assert.include(stdout, 'first --include works');
    done();
  });
}

function testMultiInclude(entry, done) {
  return testInclude(entry, [helper1, helper2], (err, stdout) => {
    assert.isNull(err);
    assert.include(stdout, 'first --include works');
    assert.include(stdout, 'second --include works');
    done();
  });
}

describe('cli --include', function () {
  context('file as entry', function () {
    beforeEach(function () {
      this.entry = path.join(testDir, 'dependent-test.js');
    });

    it('single --include', function (done) {
      testSingleInclude(this.entry, done);
    });

    it('multiple --include', function (done) {
      testMultiInclude(this.entry, done);
    });
  });

  context('dir as entry', function () {
    beforeEach(function () {
      this.entry = testDir;
    });

    it('single --include', function (done) {
      testSingleInclude(this.entry, done);
    });

    it('multiple --include', function (done) {
      testMultiInclude(this.entry, done);
    });
  });

  context('glob as entry', function () {
    beforeEach(function () {
      this.entry = path.join(testDir, '*.js');
    });

    it('single --include', function (done) {
      testSingleInclude(this.entry, done);
    });

    it('multiple --include', function (done) {
      testMultiInclude(this.entry, done);
    });
  });

  context('include types', function () {
    it('include project file', function (done) {
      testSingleInclude(testDir, done);
    });

    it('include node_module', function (done) {
      testInclude(path.join(testDir, 'test.js'), ['chai'], (err) => {
        assert.isNull(err);
        done();
      });
    });
  });
});
