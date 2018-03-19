/* eslint-env node, mocha */
/* eslint-disable func-names, max-len */

import { assert } from 'chai';
import path from 'path';
import { spawn } from 'child_process';
import del from 'del';
import fs from 'fs-extra';

const fixtureDir = path.join(process.cwd(), '.tmp/fixture');

const deleteTest = (fileName) => del(path.join(fixtureDir, fileName));

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


const waitFor = (condition, timeoutInMs) => new Promise((resolve, reject) => {
  const startTime = Date.now();
  const endTime = startTime + timeoutInMs;

  const remainingTime = () => Math.max(endTime - Date.now(), 0);
  const timeoutDelay = () => Math.min(remainingTime(), 500);

  const run = () => {
    let result = false;
    let error = null;
    try {
      result = condition();
    } catch (e) {
      error = e;
      result = false;
    }

    if (result !== false && error === null) {
      resolve();
    } else if (remainingTime() > 0) {
      setTimeout(run, timeoutDelay());
    } else if (error != null) {
      reject(error);
    } else {
      reject(new Error(`Condition not met within time: ${condition.toString()}`));
    }
  };
  setTimeout(run, timeoutDelay());
});

const spawnMochaWebpack = (...args) => {
  let data = '';
  const binPath = path.relative(process.cwd(), path.join('bin', 'mocha-webpack'));

  const child = spawn('node', [binPath, '--mode', 'development', ...args]);
  const receiveData = (d) => {
    data += d.toString();
  };

  child.stdout.on('data', receiveData);
  child.stderr.on('data', receiveData);

  return {
    get log() {
      return data;
    },
    clearLog() {
      data = '';
    },
    kill() {
      child.stdout.removeListener('data', receiveData);
      child.stderr.removeListener('data', receiveData);
      child.kill();
    },
  };
};


describe('cli --watch', function () {
  // Retry all tests in this suite up to 4 times
  this.retries(4);

  beforeEach(function () {
    this.testGlob = path.join(fixtureDir, '*.js');
    this.entryGlob = path.relative(process.cwd(), this.testGlob);
  });

  it('should log syntax error and wait until that is fixed before running tests', function () {
    this.timeout(10000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createSyntaxErrorTest(testFile, testId);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, 'Unexpected token'), 5000))
      // output matched our condition
      .then(() => {
        assert.notInclude(mw.log, testId);
        assert.notInclude(mw.log, 'failing');
        assert.notInclude(mw.log, 'passing');

        // clear log to receive only changes
        mw.clearLog();

        // fix test
        const updatedTestId = testId + 100;
        createTest(testFile, updatedTestId, true);
        return updatedTestId;
      })
      // wait until the output matches our condition
      .then((updatedTestId) => waitFor(() => assert.include(mw.log, updatedTestId) && assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        // check if test was updated
        assert.notInclude(mw.log, testId);
      })
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should catch other errors outside of tests', function () {
    this.timeout(10000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createErrorFile(testFile, testId);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, `Error ${testFile}`), 5000))
      // output matched our condition
      .then(() => {
        assert.include(mw.log, 'Exception occurred while loading your tests');
        assert.include(mw.log, testId);
        assert.notInclude(mw.log, 'passing');
        assert.notInclude(mw.log, 'failing');

        // clear log to receive only changes
        mw.clearLog();

        // fix test
        const updatedTestId = testId + 100;
        createTest(testFile, updatedTestId, true);
        return updatedTestId;
      })
      // wait until the output matches our condition
      .then((updatedTestId) => waitFor(() => assert.include(mw.log, updatedTestId) && assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        // check if test was updated
        assert.notInclude(mw.log, testId);
      })
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should catch uncaught errors that occur after tests are done', function () {
    this.timeout(10000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createUncaughtErrorTest(testFile, testId);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, 'UNCAUGHT EXCEPTION'), 5000))
      // output matched our condition
      .then(() => {
        assert.include(mw.log, 'Exception occurred after running tests');
        assert.include(mw.log, '1 passing');
        assert.include(mw.log, testFile);
        assert.include(mw.log, testId);

        // clear log to receive only changes
        mw.clearLog();

        // fix test
        const updatedTestId = testId + 100;
        createTest(testFile, updatedTestId, true);
        return updatedTestId;
      })
      // wait until the output matches our condition
      .then((updatedTestId) => waitFor(() => assert.include(mw.log, updatedTestId) && assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        // check if test was updated
        assert.notInclude(mw.log, testId);
      })
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should run a test', function () {
    this.timeout(5000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createTest(testFile, testId, true);

    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, testId) && assert.include(mw.log, '1 passing'), 5000))
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should run a test again when it changes', function () {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    createTest(testFile, testId, true);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, testId) && assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        // clear log to receive only changes
        mw.clearLog();

        // update test
        const updatedTestId = testId + 100;
        createTest(testFile, updatedTestId, true);
        return updatedTestId;
      })
      // wait until the output matches our condition
      .then((updatedTestId) => waitFor(() => assert.include(mw.log, updatedTestId) && assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        // check if test was updated
        assert.notInclude(mw.log, testId);
      })
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should run only the changed test again when it changes', function () {
    this.timeout(15000);
    const testFile1 = 'test1.js';
    const testFile2 = 'test2.js';
    const testId1 = Date.now() + 1;
    const testId2 = testId1 + 2;
    createTest(testFile1, testId1, true);
    createTest(testFile2, testId2, true);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, '2 passing'), 5000))
      // output matched our condition
      .then(() => {
        // check if both tests were tested
        assert.include(mw.log, testId1);
        assert.include(mw.log, testFile1);
        assert.include(mw.log, testId2);
        assert.include(mw.log, testFile2);

        // clear log to receive only changes
        mw.clearLog();

        // update test
        const updatedTestId = testId2 + 100;
        createTest(testFile2, updatedTestId, true);
        return updatedTestId;
      })
      // wait until the output matches our condition
      .then((updatedTestId) => waitFor(() => assert.include(mw.log, updatedTestId) && assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        // check if just updated test was tested again
        assert.notInclude(mw.log, testFile1);
        assert.notInclude(mw.log, testId1);
      })
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should abort test suite when a file changes while running tests and then test again', function () {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    const updatedTestId = testId + 100;
    createLongRunningTest(testFile, testId);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the first async test start
      .then(() => waitFor(() => assert.include(mw.log, `starting ${testId} - 1`), 5000))
      .then(() => {
        // check if tests were not ready yet
        assert.notInclude(mw.log, `starting ${testId} - 2`);
        assert.notInclude(mw.log, `finished ${testId} - 2`);

        // clear log to receive only changes
        mw.clearLog();

        // update test
        createTest(testFile, updatedTestId, true);
      })
      // wait until tests were aborted
      .then(() => waitFor(() => assert.include(mw.log, 'Tests aborted'), 5000))
      .then(() => {
        // check if tests were aborted
        assert.notInclude(mw.log, `finished ${testId} - 2`);
      })
      // wait until tests were tested again
      .then(() => waitFor(() => assert.include(mw.log, updatedTestId) && assert.include(mw.log, '1 passing'), 5000))
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should also abort tests that will never finish (e.g. by mistake) when timeouts are disabled and run tests again', function () {
    this.timeout(15000);
    const testFile = 'test1.js';
    const testId = Date.now();
    const updatedTestId = testId + 100;
    createNeverEndingTest(testFile, testId);
    const mw = spawnMochaWebpack('--timeout', 0, '--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the first async test start
      .then(() => waitFor(() => assert.include(mw.log, `starting ${testId}`), 5000))
      .then(() => {
        // clear log to receive only changes
        mw.clearLog();

        // update test
        createTest(testFile, updatedTestId, true);
      })
      // wait until tests were aborted
      .then(() => waitFor(() => assert.include(mw.log, 'Tests aborted'), 5000))
      .then(() => {
        // check if tests were aborted
        assert.notInclude(mw.log, `finished ${testId} - 2`);
      })
      // wait until tests were tested again
      .then(() => waitFor(() => assert.include(mw.log, updatedTestId) && assert.include(mw.log, '1 passing'), 5000))
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should recognize new test entries that match the pattern', function () {
    this.timeout(10000);
    const testFile1 = 'test1.js';
    const testId1 = Date.now() + 1;
    const testFile2 = 'test2.js';
    const testId2 = testId1 + 2;
    createTest(testFile1, testId1, true);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, testId1) && assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        // clear log to receive only changes
        mw.clearLog();
        // create new test
        createTest(testFile2, testId2, true);
      })
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, testId2) && assert.include(mw.log, 'passing'), 5000))
      .then(() => {
        assert.notInclude(mw.log, testId1);
        assert.notInclude(mw.log, testFile1);
      })
      // output matched our condition
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should recognize multiple new test entries that match the pattern', function () {
    this.timeout(10000);
    const testFile1 = 'test1.js';
    const testId1 = Date.now() + 1;
    const testFile2 = 'test2.js';
    const testId2 = testId1 + 2;
    const testFile3 = 'test3.js';
    const testId3 = testId2 + 3;
    createTest(testFile1, testId1, true);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, '1 passing'), 5000))
      // output matched our condition
      .then(() => {
        assert.include(mw.log, testId1);
        assert.include(mw.log, testFile1);

        // clear log to receive only changes
        mw.clearLog();

        // create new tests
        createTest(testFile2, testId2, true);
        createTest(testFile3, testId3, true);
      })
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, testId2) && assert.include(mw.log, testId3) && assert.include(mw.log, 'passing'), 5000))
      .then(() => {
        assert.notInclude(mw.log, testId1);
        assert.notInclude(mw.log, testFile1);
      })
      // output matched our condition
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  it('should recognize deleted test entries that match the pattern', function () {
    this.timeout(10000);
    const testFile1 = 'test1.js';
    const testFile2 = 'test2.js';
    const testId1 = Date.now() + 1;
    const testId2 = Date.now() + 2;
    createTest(testFile1, testId1, true);
    createTest(testFile2, testId2, true);
    const mw = spawnMochaWebpack('--watch', this.entryGlob);

    return Promise
      .resolve()
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, '2 passing'), 5000))
      // output matched our condition
      .then(() => {
        assert.include(mw.log, testId1);
        assert.include(mw.log, testFile1);
        assert.include(mw.log, testId2);
        assert.include(mw.log, testFile2);

        // clear log to receive only changes
        mw.clearLog();

        // delete test
        deleteTest(testFile2);
      })
      // wait until the output matches our condition
      .then(() => waitFor(() => assert.include(mw.log, 'passing'), 5000))
      .then(() => {
        assert.notInclude(mw.log, testId2);
      })
      .catch((e) => e)
      .then((e) => {
        // finally, kill watch process
        mw.kill();
        // maybe rethrow error
        assert.ifError(e);
      });
  });

  afterEach(function () {
    return del(this.testGlob);
  });
});
