/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { spawn } from 'child_process';
import del from 'del';
import fs from 'fs-extra';

const fixtureDir = path.join(process.cwd(), '.tmp/fixture');
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));

const createTest = (fileName, testName, passing) => {
  const content = `
    var assert = require('assert');
    describe('${fileName} - ${testName}', function () {
      it('runs test', function () {
        assert.ok(${passing});
      });
    });
  `;
  fs.outputFileSync(path.join(fixtureDir, fileName), content);
};

function createSyntaxErrorTest(fileName, testName) {
  const content = `
    var assert = require('assert');
    describe('${fileName} - ${testName}', function () {
      it('runs test', function () {
        assert.ok(false);
    });
  `;
  fs.outputFileSync(path.join(fixtureDir, fileName), content);
}

function createUncaughtErrorTest(fileName, testName) {
  const content = `
    describe('${fileName} - ${testName}', function () {
      it('runs test', function () {
        setTimeout(function () {
          done(); // done is undefined -> uncaught error
        }, 1000);
      });
    });
  `;
  fs.outputFileSync(path.join(fixtureDir, fileName), content);
}

function createErrorFile(fileName, testName) {
  const content = `
    throw new Error('Error ${fileName} ${testName}');
  `;
  fs.outputFileSync(path.join(fixtureDir, fileName), content);
}

const createLongRunningTest = (fileName, testName) => {
  const content = `
    var assert = require('assert');
    describe('${fileName} - ${testName} - 1', function () {      
      it('runs test 1' , function (done) {
        this.timeout(3000);
        console.log('starting ${testName} - 1');
        setTimeout(function() {
          console.log('finished ${testName} - 1');
          done();
        }, 2000);
      });
    });
    
    describe('${fileName} - ${testName}', function () {
      it('runs test 2' , function (done) {
        this.timeout(3000);
        console.log('starting ${testName} - 2');
        setTimeout(function() {
          console.log('finished ${testName} - 2');
          done();
        }, 2000);
      });
    });
  `;
  fs.outputFileSync(path.join(fixtureDir, fileName), content);
};

const createNeverEndingTest = (fileName, testName) => {
  const content = `
    var assert = require('assert');
    describe('${fileName} - ${testName} - 1', function () {      
      it('runs test 1' , function (done) {
        console.log('starting ${testName}');
      });
    });
  `;
  fs.outputFileSync(path.join(fixtureDir, fileName), content);
};

const waitUntil = (condition, fn, timeout) => {
  const start = Date.now();
  const run = () => {
    if (condition()) {
      setTimeout(() => fn(true), 100); // delay execution
    } else if (Date.now() < start + timeout) {
      setTimeout(run, 10);
    } else {
      fn(false);
    }
  };
  setTimeout(run, 10);
};


describe('cli --watch', function () {
  beforeEach(function () {
    this.testGlob = path.join(fixtureDir, '*.js');
    this.entryGlob = path.relative(process.cwd(), this.testGlob);
  });

  it('should log syntax error and wait until that is fixed before running tests', function (done) {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createSyntaxErrorTest(testFile, testId);

    let data = '';
    const ls = spawn('node', [binPath, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes('Unexpected token'), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.notInclude(data, testId);
      assert.notInclude(data, 'failing');
      assert.notInclude(data, 'passing');

      // reset data to receive only changes
      data = '';

      // update test
      const updatedTestId = Date.now();
      waitUntil(() => data.includes('passing'), (condition2) => {
        assert.isTrue(condition2, 'expected condition2 should be true');

        // check if fixed test was tested
        assert.notInclude(data, testId);
        assert.include(data, updatedTestId);
        assert.include(data, '1 passing');

        // kill watch process
        ls.kill();
        done();
      }, 5000);
      createTest(testFile, updatedTestId, true);
    }, 5000);
  });

  it('should catch other errors outside of tests', function (done) {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createErrorFile(testFile, testId);

    let data = '';
    const ls = spawn('node', [binPath, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes(`Error ${testFile}`), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.include(data, 'An exception occurred while loading tests');
      assert.include(data, testFile);
      assert.include(data, testId);
      assert.notInclude(data, 'passing');
      assert.notInclude(data, 'failing');

      // reset data to receive only changes
      data = '';

      // update test
      const updatedTestId = Date.now();
      waitUntil(() => data.includes('passing'), (condition2) => {
        assert.isTrue(condition2, 'expected condition2 should be true');

        // check if fixed test was tested
        assert.notInclude(data, testId);
        assert.include(data, updatedTestId);
        assert.include(data, '1 passing');

        // kill watch process
        ls.kill();
        done();
      }, 5000);
      createTest(testFile, updatedTestId, true);
    }, 5000);
  });

  it('should catch uncaught errors that occur after tests are done', function (done) {
    this.timeout(10000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createUncaughtErrorTest(testFile, testId);

    let data = '';
    const ls = spawn('node', [binPath, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes('An uncaught exception occurred'), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.include(data, '1 passing');

      assert.include(data, testFile);
      assert.include(data, testId);

      // reset data to receive only changes
      data = '';

      // update test to check if process is still alive
      const updatedTestId = Date.now();
      waitUntil(() => data.includes('passing'), (condition2) => {
        assert.isTrue(condition2, 'expected condition2 should be true');

        // check if fixed test was tested
        assert.notInclude(data, testId);
        assert.include(data, updatedTestId);
        assert.include(data, '1 passing');

        // kill watch process
        ls.kill();
        done();
      }, 5000);
      createTest(testFile, updatedTestId, true);
    }, 5000);
  });

  it('should run a test', function (done) {
    this.timeout(10000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createTest(testFile, testId, true);

    let data = '';
    const ls = spawn('node', [binPath, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes(testId), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.include(data, testId);
      assert.include(data, testFile);
      assert.include(data, '1 passing');

      // kill watch process
      done();
      ls.kill();
    }, 5000);
  });

  it('should run a test again when it changes', function (done) {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createTest(testFile, testId, true);

    let data = '';
    const ls = spawn('node', [binPath, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes(testId), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.include(data, testId);
      assert.include(data, testFile);
      assert.include(data, '1 passing');

      // reset data to receive only changes
      data = '';

      // update test
      const updatedTestId = Date.now();
      waitUntil(() => data.includes(updatedTestId), (condition2) => {
        assert.isTrue(condition2, 'expected condition2 should be true');
        // check if updated test was tested again
        assert.include(data, updatedTestId);
        assert.include(data, testFile);
        assert.include(data, '1 passing');

        // kill watch process
        ls.kill();
        done();
      }, 5000);
      createTest(testFile, updatedTestId, true);
    }, 5000);
  });

  it('should run only the changed test again when it changes', function (done) {
    this.timeout(15000);
    const testFile1 = 'test1.js';
    const testFile2 = 'test2.js';
    const testId1 = Date.now() + 1;
    const testId2 = Date.now() + 2;
    createTest(testFile1, testId1, true);
    createTest(testFile2, testId2, true);

    let data = '';
    const ls = spawn('node', [binPath, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes(testId1), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.include(data, testId1);
      assert.include(data, testFile1);
      assert.include(data, testId2);
      assert.include(data, testFile2);
      assert.include(data, '2 passing');

      // reset data to receive only changes
      data = '';

      // update test
      const updatedTestId = Date.now();
      waitUntil(() => data.includes(updatedTestId), (condition2) => {
        assert.isTrue(condition2, 'expected condition2 should be true');
        // check if updated test was tested again
        assert.include(data, updatedTestId);
        assert.include(data, testFile2);

        // check if just updated test was tested again
        assert.include(data, '1 passing');
        assert.notInclude(data, testFile1);
        assert.notInclude(data, testId1);

        // kill watch process
        ls.kill();
        done();
      }, 5000);
      createTest(testFile2, updatedTestId, true);
    }, 5000);
  });

  it('should abort tests suite when a file changes while running tests and then test again', function (done) {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createLongRunningTest(testFile, testId);

    let data = '';
    const ls = spawn('node', [binPath, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes(`starting ${testId}`), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.include(data, testId);
      assert.include(data, `starting ${testId} - 1`);
      assert.notInclude(data, `starting ${testId} - 2`);
      assert.notInclude(data, `finished ${testId} - 2`);

      // reset data to receive only changes
      data = '';

      // update test
      const updatedTestId = Date.now();
      waitUntil(() => data.includes(`finished ${updatedTestId} - 2`), (condition2) => {
        assert.isTrue(condition2, 'expected condition2 should be true');

        // check if tests were aborted
        assert.notInclude(data, `finished ${testId} - 2`);
        assert.include(data, '0 passing', 'test suite should abort current async test');
        assert.include(data, '1 failing', 'test suite should mark async test as failed');

        // check if updated test was tested again
        assert.include(data, `starting ${updatedTestId} - 1`);
        assert.include(data, `finished ${updatedTestId} - 1`);
        assert.include(data, `starting ${updatedTestId} - 2`);
        assert.include(data, `finished ${updatedTestId} - 2`);
        assert.include(data, '2 passing');

        // kill watch process
        ls.kill();
        done();
      }, 6000);
      createLongRunningTest(testFile, updatedTestId);
    }, 6000);
  });

  it('should also abort tests that will never finish (e.g. by mistake) when timeouts are disabled and run tests again', function (done) {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createNeverEndingTest(testFile, testId);

    let data = '';
    const ls = spawn('node', [binPath, '--timeout', 0, '--watch', this.entryGlob]);
    const receiveData = (d) => {
      data += d;
    };

    ls.stdout.on('data', receiveData);
    ls.stderr.on('data', receiveData);

    // wait for initial test
    waitUntil(() => data.includes(`starting ${testId}`), (condition1) => {
      assert.isTrue(condition1, 'expected condition1 should be true');
      assert.include(data, testId);
      assert.include(data, `starting ${testId}`);
      assert.notInclude(data, 'passing');
      assert.notInclude(data, 'failing');

      // reset data to receive only changes
      data = '';

      // update test
      const updatedTestId = Date.now();
      waitUntil(() => data.includes('1 passing'), (condition2) => {
        assert.isTrue(condition2, 'expected condition2 should be true');

        // check if tests were aborted
        assert.include(data, '0 passing', 'test suite should abort current async test');
        assert.include(data, '1 failing', 'test suite should mark async test as failed');

        // check if updated test was tested again
        assert.include(data, updatedTestId);
        assert.include(data, '1 passing');

        // kill watch process
        ls.kill();
        done();
      }, 4000);
      createTest(testFile, updatedTestId, true);
    }, 4000);
  });


  afterEach(function () {
    return del(this.testGlob);
  });
});
