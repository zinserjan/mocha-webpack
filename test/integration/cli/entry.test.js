/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import _ from 'lodash';
import fs from 'fs-extra';
import del from 'del';
import path from 'path';
import { exec } from 'child_process';
import anymatch from 'anymatch';
import normalizePath from 'normalize-path';

const escapePath = (p) => p.replace(/\\/gm, '\\\\');

function createTest(filePath, passing) {
  const content = `
    var assert = require('assert');
    describe('${escapePath(filePath)}', function () {
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
    describe('${escapePath(filePath)}', function () {
      it('runs test', function () {
        assert.ok(false);
    });
  `;
  fs.outputFileSync(filePath, content);
}

function createRuntimeErrorTest(filePath, passing) {
  const content = `
    var assert = require('assert');
    throw new Error('error in ${escapePath(filePath)}');
    describe('${escapePath(filePath)}', function () {
      it('runs test', function () {
        assert.ok(${passing});
      });
    });
  `;
  fs.outputFileSync(filePath, content);
}

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const fixtureDirTmp = path.relative(process.cwd(), path.join(__dirname, 'fixtureTmp'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));

describe('cli - entry', function () {
  context('single test file as option', function () {
    before(function () {
      this.passingTest = normalizePath(path.join(fixtureDirTmp, 'passing-test.js'));
      this.failingTest = normalizePath(path.join(fixtureDirTmp, 'failing-test.js'));
      this.corruptedTest = normalizePath(path.join(fixtureDirTmp, 'corrupted-test.js'));
      this.runtimeErrorTest = normalizePath(path.join(fixtureDirTmp, 'runtime-error-test.js'));
      createTest(this.passingTest, true);
      createTest(this.failingTest, false);
      createCorruptedTest(this.corruptedTest);
      createRuntimeErrorTest(this.runtimeErrorTest);
    });

    it('handles failed module with syntax errors', function (done) {
      exec(`node ${binPath} --mode development "${this.corruptedTest}"`, (err) => {
        assert.isNotNull(err);
        assert.isAbove(err.code, 0);
        done();
      });
    });

    it('handles module with runtime errors', function (done) {
      exec(`node ${binPath} --mode development "${this.runtimeErrorTest}"`, (err) => {
        assert.isNotNull(err);
        assert.isAbove(err.code, 0);
        done();
      });
    });


    it('runs successfull test', function (done) {
      exec(`node ${binPath} --mode development "${this.passingTest}"`, (err, stdout) => {
        assert.isNull(err);
        assert.include(stdout, this.passingTest);
        assert.include(stdout, '1 passing');
        done();
      });
    });

    it('runs failing test', function (done) {
      exec(`node ${binPath} --mode development "${this.failingTest}"`, (err, stdout) => {
        assert.isNotNull(err);
        assert.strictEqual(err.code, 1);
        assert.include(stdout, this.failingTest);
        assert.include(stdout, '0 passing');
        assert.include(stdout, '1 failing');
        done();
      });
    });

    after(function () {
      return del([this.passingTest, this.failingTest, this.corruptedTest, this.runtimeErrorTest]);
    });
  });

  context('multiple test files as option', function () {
    before(function () {
      this.passingTest = normalizePath(path.join(fixtureDirTmp, 'passing-test.js'));
      this.passingTest2 = normalizePath(path.join(fixtureDirTmp, 'passing-test2.js'));
      this.failingTest = normalizePath(path.join(fixtureDirTmp, 'failing-test.js'));
      this.failingTest2 = normalizePath(path.join(fixtureDirTmp, 'failing-test2.js'));
      this.corruptedTest = normalizePath(path.join(fixtureDirTmp, 'corrupted-test.js'));
      this.corruptedTest2 = normalizePath(path.join(fixtureDirTmp, 'corrupted-test2.js'));
      createTest(this.passingTest, true);
      createTest(this.passingTest2, true);
      createTest(this.failingTest, false);
      createTest(this.failingTest2, false);
      createCorruptedTest(this.corruptedTest);
      createCorruptedTest(this.corruptedTest2);
    });

    it('handles failed module with syntax errors', function (done) {
      exec(`node ${binPath} --mode development "${this.corruptedTest}" "${this.corruptedTest2}"`, (err) => {
        assert.isNotNull(err);
        assert.isAbove(err.code, 0);
        done();
      });
    });

    it('runs successfull test', function (done) {
      exec(`node ${binPath} --mode development "${this.passingTest}" "${this.passingTest2}"`, (err, stdout) => {
        assert.isNull(err);
        assert.include(stdout, this.passingTest);
        assert.include(stdout, this.passingTest2);
        assert.include(stdout, '2 passing');
        done();
      });
    });

    it('runs failing test', function (done) {
      exec(`node ${binPath} --mode development "${this.failingTest}" "${this.failingTest2}"`, (err, stdout) => {
        assert.isNotNull(err);
        assert.strictEqual(err.code, 2);
        assert.include(stdout, this.failingTest);
        assert.include(stdout, this.failingTest2);
        assert.include(stdout, '0 passing');
        assert.include(stdout, '2 failing');
        done();
      });
    });

    after(function () {
      return del([this.passingTest, this.passingTest2, this.failingTest, this.failingTest2, this.corruptedTest, this.corruptedTest2]);
    });
  });

  context('entry with absolute paths', function () {
    before(function () {
      this.passingTest = path.join(process.cwd(), fixtureDirTmp, 'passing-test.js');
      createTest(this.passingTest, true);
    });

    it('runs test with absolute entry', function (done) {
      exec(`node ${binPath} --mode development "${this.passingTest}"`, (err, stdout) => {
        assert.isNull(err);
        assert.include(stdout, this.passingTest);
        assert.include(stdout, '1 passing');
        done();
      });
    });

    after(function () {
      return del([this.passingTest]);
    });
  });

  context('glob pattern as option', function () {
    const testFiles = _.range(1, 30).map((x) => {
      if (parseInt(x / 10, 10) === 0) {
        if (x <= 4) {
          return path.join(fixtureDirTmp, `passing-test-${x}.js`);
        } else if (x <= 8) {
          return path.join(fixtureDirTmp, `failing-test-${x}.js`);
        }
        return path.join(fixtureDirTmp, `corrupted-test-${x}.js`);
      } else if (parseInt(x / 10, 10) === 1) {
        return path.join(fixtureDirTmp, 'sub1', `passing-test-${x}.js`);
      }
      return path.join(fixtureDirTmp, 'sub2', `passing-test-${x}.js`);
    }).map((file) => normalizePath(file));

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
      path.join(fixtureDirTmp, 'corrupted-*.js'),
    ];

    corruptedPatterns.forEach((pattern) => {
      it(`handles corrupted modules with pattern '${pattern}'`, function (done) {
        exec(`node ${binPath} --mode development "${pattern}"`, (err) => {
          assert.isNotNull(err);
          assert.isAbove(err.code, 0);
          done();
        });
      });
    });

    const passingPatterns = [
      path.join(fixtureDirTmp, 'passing-*.js'),
      path.join(fixtureDirTmp, 'passing-*-1.js'),
      path.join(fixtureDirTmp, '**/passing-*.js'),
    ];

    passingPatterns.forEach((pattern) => {
      const matcher = anymatch(pattern);
      const files = testFiles.filter(matcher);

      it(`runs ${files.length} passing tests of ${testFiles.length} with pattern '${pattern}'`, function (done) {
        exec(`node ${binPath} --mode development "${pattern}"`, (err, stdout) => {
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
      path.join(fixtureDirTmp, 'failing-*.js'),
      path.join(fixtureDirTmp, 'failing-*-7.js'),
      path.join(fixtureDirTmp, 'failing-*-@(5|6).js'),
    ];

    failingPatterns.forEach((pattern) => {
      const matcher = anymatch(pattern);
      const files = testFiles.filter(matcher);

      it(`runs ${files.length} failing tests of ${testFiles.length} with pattern '${pattern}'`, function (done) {
        exec(`node ${binPath} --mode development "${pattern}"`, (err, stdout) => {
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

    const multiPassingPatterns = [
      path.join(fixtureDirTmp, 'passing-*-1.js'),
      path.join(fixtureDirTmp, 'passing-*-2.js'),
      path.join(fixtureDirTmp, 'passing-*-3.js'),
    ];

    const pattern = multiPassingPatterns.map((str) => `"${str}"`).join(' ');
    const matcher = anymatch(multiPassingPatterns);
    const files = testFiles.filter(matcher);

    it(`runs ${files.length} passing tests of ${testFiles.length} with pattern '${pattern}'`, function (done) {
      exec(`node ${binPath} --mode development ${pattern}`, (err, stdout) => {
        assert.isNull(err);
        files.forEach((file) => {
          assert.include(stdout, file);
        });
        assert.include(stdout, `${files.length} passing`);
        done();
      });
    });

    after(function () {
      return del(testFiles);
    });
  });

  context('directory as option', function () {
    const subdirectories = ['', 'sub1', 'sub2'];

    context('directory with passing tests', function () {
      before(function () {
        this.testFiles = _.range(1, 10).map((x) => {
          const subdir = subdirectories[x % 3];
          return path.join(fixtureDirTmp, subdir, `passing-test-${x}.js`);
        }).map((file) => normalizePath(file));
        this.testFiles.forEach((file) => createTest(file, true));
      });

      it('runs all tests in directory\'', function (done) {
        const matcher = anymatch(`${fixtureDirTmp}/*.js`);
        const files = this.testFiles.filter(matcher);

        exec(`node ${binPath} --mode development "${fixtureDirTmp}"`, (err, stdout) => {
          assert.isNull(err);
          files.forEach((file) => {
            assert.include(stdout, file);
          });
          assert.include(stdout, `${files.length} passing`);
          done();
        });
      });

      it('runs all tests matching file glob\'', function (done) {
        const matcher = anymatch(`${fixtureDirTmp}/*-test-3.js`);
        const files = this.testFiles.filter(matcher);
        exec(`node ${binPath} --mode development --glob "*-test-3.js" "${fixtureDirTmp}"`, (err, stdout) => {
          assert.isNull(err);
          files.forEach((file) => {
            assert.include(stdout, file);
          });
          assert.include(stdout, `${files.length} passing`);
          done();
        });
      });


      it('runs all tests in directory & subdirectories\'', function (done) {
        const matcher = anymatch(`${fixtureDirTmp}/**/*.js`);
        const files = this.testFiles.filter(matcher);

        exec(`node ${binPath} --mode development --recursive "${fixtureDirTmp}"`, (err, stdout) => {
          assert.isNull(err);
          files.forEach((file) => {
            assert.include(stdout, file);
          });
          assert.include(stdout, `${files.length} passing`);
          done();
        });
      });

      after(function () {
        return del(this.testFiles);
      });
    });

    context('directory with failing tests', function () {
      before(function () {
        this.testFiles = _.range(1, 10).map((x) => {
          const subdir = subdirectories[x % 3];
          return path.join(fixtureDirTmp, subdir, `failing-test-${x}.js`);
        }).map((file) => normalizePath(file));
        this.testFiles.forEach((file) => createTest(file, false));
      });

      it('runs all tests in directory\'', function (done) {
        const matcher = anymatch(`${fixtureDirTmp}/*.js`);
        const files = this.testFiles.filter(matcher);

        exec(`node ${binPath} --mode development "${fixtureDirTmp}"`, (err, stdout) => {
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

      it('runs all tests in directory & subdirectories\'', function (done) {
        const matcher = anymatch(`${fixtureDirTmp}/**/*.js`);
        const files = this.testFiles.filter(matcher);

        exec(`node ${binPath} --mode development --recursive "${fixtureDirTmp}"`, (err, stdout) => {
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

      after(function () {
        return del(this.testFiles);
      });
    });

    context('directory with corrupted modules', function () {
      before(function () {
        this.testFiles = _.range(1, 10).map((x) => {
          const subdir = subdirectories[x % 3];
          return path.join(fixtureDirTmp, subdir, `corrupted-test-${x}.js`);
        }).map((file) => normalizePath(file));
        this.testFiles.forEach((file) => createCorruptedTest(file));
      });

      it('fails before running tests of directory', function (done) {
        exec(`node ${binPath} --mode development "${fixtureDirTmp}"`, (err) => {
          assert.isNotNull(err);
          assert.isAbove(err.code, 0);
          done();
        });
      });

      it('fails before running tests of directory directory & subdirectories\'', function (done) {
        exec(`node ${binPath} --mode development --recursive "${fixtureDirTmp}"`, (err) => {
          assert.isNotNull(err);
          assert.isAbove(err.code, 0);
          done();
        });
      });

      after(function () {
        return del(this.testFiles);
      });
    });
  });


  context('respect file extensions in webpack config via resolve.extensions for directory entries', function () {
    before(function () {
      this.index = 0;
      this.configPath = path.join(fixtureDir, 'config', 'config.resolve-extensions.js');
      this.testDir = path.join(fixtureDirTmp, 'resolve-test');
      this.testFiles = ['ts', 'tsx', 'js', 'jsx']
        .map((ext) => path.join(this.testDir, `passing-test-${this.index++}.${ext}`))
        .map((file) => normalizePath(file));

      this.ignoredFiles = ['coffee']
        .map((ext) => path.join(this.testDir, `passing-test-${this.index++}.${ext}`))
        .map((file) => normalizePath(file));

      this.testFiles.forEach((file) => createTest(file, true));
      this.ignoredFiles.forEach((file) => createTest(file, true));
    });

    it('resolve.extensions will be used for module resolution when no --glob is given', function (done) {
      exec(`node ${binPath} --mode development --webpack-config "${this.configPath}" "${this.testDir}"`, (err, stdout) => {
        assert.isNull(err);
        this.testFiles.forEach((file) => {
          assert.include(stdout, file);
        });
        this.ignoredFiles.forEach((file) => {
          assert.notInclude(stdout, file);
        });
        assert.include(stdout, `${this.testFiles.length} passing`);
        done();
      });
    });

    it('resolve.extensions will not be used for module resolution when --glob is given', function (done) {
      const matcher = anymatch(`${this.testDir}/*.js`);
      const files = this.testFiles.filter(matcher);
      exec(`node ${binPath} --mode development --webpack-config "${this.configPath}" --glob "*.js" "${this.testDir}"`, (err, stdout) => {
        assert.isNull(err);
        files.forEach((file) => {
          assert.include(stdout, file);
        });
        assert.include(stdout, `${files.length} passing`);
        done();
      });
    });

    after(function () {
      return del([].concat(this.testFiles, this.ignoredFiles));
    });
  });
});
