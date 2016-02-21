/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import _ from 'lodash';
import fs from 'fs-extra';
import del from 'del';
import path from 'path';
import { exec } from 'child_process';
import anymatch from 'anymatch';


function createTest(filePath, passing) {
  const content = `
    var assert = require('assert');
    describe('${filePath}', function () {
      it('runs test', function () {
        assert.ok(${passing});
      });
    });
  `;
  fs.outputFileSync(filePath, content);
}

function createCorruptedTest(filePath) {
  const content = `
    var assert = require('assert');
    describe('${filePath}', function () {
      it('runs test', function () {
        assert.ok(false);
    });
  `;
  fs.outputFileSync(filePath, content);
}

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));

describe('cli', function () {
  context('single test file as option', function () {
    before(function () {
      this.passingTest = path.join(fixtureDir, 'passing-test.js');
      this.failingTest = path.join(fixtureDir, 'failing-test.js');
      this.corruptedTest = path.join(fixtureDir, 'corrupted-test.js');
      createTest(this.passingTest, true);
      createTest(this.failingTest, false);
      createCorruptedTest(this.corruptedTest);
    });

    it('handles failed module with syntax errors', function (done) {
      exec(`node ${binPath} ${this.corruptedTest}`, (err) => {
        assert.isNotNull(err);
        assert.isAbove(err.code, 0);
        done();
      });
    });

    it('runs successfull test', function (done) {
      exec(`node ${binPath} ${this.passingTest}`, (err, stdout) => {
        assert.isNull(err);
        assert.include(stdout, this.passingTest);
        assert.include(stdout, '1 passing');
        done();
      });
    });

    it('runs failing test', function (done) {
      exec(`node ${binPath} ${this.failingTest}`, (err, stdout) => {
        assert.isNotNull(err);
        assert.strictEqual(err.code, 1);
        assert.include(stdout, this.failingTest);
        assert.include(stdout, '0 passing');
        assert.include(stdout, '1 failing');
        done();
      });
    });

    after(function () {
      return del([this.passingTest, this.failingTest, this.corruptedTest]);
    });
  });

  context('glob pattern as option', function () {
    const testFiles = _.range(1, 30).map((x) => {
      if (parseInt(x / 10, 10) === 0) {
        if (x <= 4) {
          return path.join(fixtureDir, `passing-test-${x}.js`);
        } else if (x <= 8) {
          return path.join(fixtureDir, `failing-test-${x}.js`);
        }
        return path.join(fixtureDir, `corrupted-test-${x}.js`);
      } else if (parseInt(x / 10, 10) === 1) {
        return path.join(fixtureDir, 'sub1', `passing-test-${x}.js`);
      }
      return path.join(fixtureDir, 'sub2', `passing-test-${x}.js`);
    });

    before(function () {
      testFiles.forEach((file) => {
        if (file.indexOf('passing-test') !== -1) {
          createTest(file, true);
        } else if (file.indexOf('failing-test') !== -1) {
          createTest(file, false);
        } else {
          createCorruptedTest(file);
        }
      });
    });

    const corruptedPatterns = [
      'test/bin/fixture/corrupted-*.js',
    ];

    corruptedPatterns.forEach((pattern) => {
      it(`handles failed modules with pattern '${pattern}'`, function (done) {
        exec(`node ${binPath} '${pattern}'`, (err) => {
          assert.isNotNull(err);
          assert.isAbove(err.code, 0);
          done();
        });
      });
    });

    const passingPatterns = [
      'test/bin/fixture/passing-*.js',
      'test/bin/fixture/passing-*-1.js',
      'test/bin/fixture/passing-*-(1|3).js',
      'test/bin/fixture/**/passing-*.js',
    ];

    passingPatterns.forEach((pattern) => {
      const matcher = anymatch(pattern);
      const files = testFiles.filter(matcher);

      it(`runs ${files.length} passing tests of ${testFiles.length} with pattern '${pattern}'`, function (done) {
        exec(`node ${binPath} '${pattern}'`, (err, stdout) => {
          assert.isNull(err);
          files.forEach((file) => {
            assert.include(stdout, file);
          });
          assert.include(stdout, `${files.length} passing`);
          done();
        });
      });
    });

    const failingPatterns = [
      'test/bin/fixture/failing-*.js',
      'test/bin/fixture/failing-*-7.js',
      'test/bin/fixture/failing-*-(5|6).js',
    ];

    failingPatterns.forEach((pattern) => {
      const matcher = anymatch(pattern);
      const files = testFiles.filter(matcher);

      it(`runs ${files.length} failing tests of ${testFiles.length} with pattern '${pattern}'`, function (done) {
        exec(`node ${binPath} '${pattern}'`, (err, stdout) => {
          assert.isNotNull(err);
          assert.strictEqual(err.code, files.length);
          files.forEach((file) => {
            assert.include(stdout, file);
          });

          assert.include(stdout, '0 passing');
          assert.include(stdout, `${files.length} failing`);
          done();
        });
      });
    });

    after(function () {
      return del(testFiles);
    });
  });
});
