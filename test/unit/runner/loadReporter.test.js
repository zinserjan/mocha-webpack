/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import { assert } from 'chai';
import spec from 'mocha/lib/reporters/spec';
import progress from 'mocha/lib/reporters/progress';

import customMochaReporter from '../../fixture/customMochaReporter';
import loadReporter from '../../../src/runner/loadReporter';

const customMochaReporterPath = require.resolve('../../fixture/customMochaReporter');

describe('loadReporter', function () {
  it('should allow to use reporter by function', function () {
    const reporter = loadReporter(spec);
    assert.strictEqual(reporter, spec, 'should equal reporter');
  });

  it('should load built-in reporter', function () {
    const reporter = loadReporter('spec');
    assert.strictEqual(reporter, spec, 'should equal built-in reporter');
  });

  it('should load reporter from node_modules', function () {
    const reporter = loadReporter('mocha/lib/reporters/progress');
    assert.strictEqual(reporter, progress, 'should equal node_module reporter');
  });

  it('should load reporter relative from real cwd (1)', function () {
    const reporter = loadReporter('./test/fixture/customMochaReporter', process.cwd());
    assert.strictEqual(reporter, customMochaReporter, 'should equal custom reporter');
  });

  it('should load reporter relative from real cwd (2)', function () {
    const reporter = loadReporter('test/fixture/customMochaReporter', process.cwd());
    assert.strictEqual(reporter, customMochaReporter, 'should equal custom reporter');
  });

  it('should load reporter with relative path from custom cwd', function () {
    const reporter = loadReporter('../../fixture/customMochaReporter', __dirname);
    assert.strictEqual(reporter, customMochaReporter, 'should equal custom reporter');
  });

  it('should load reporter with absolute path', function () {
    const reporter = loadReporter(customMochaReporterPath, process.cwd());
    assert.strictEqual(reporter, customMochaReporter, 'should equal custom reporter');
  });

  it('throws error when not found', function () {
    const load = () => {
      loadReporter('xxx/xxxx/xxxx/test.js', process.cwd());
    };

    assert.throws(load, /Cannot find module/);
  });
});
