/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import path from 'path';
import { assert } from 'chai';
import loadUI from '../../../src/runner/loadUI';

const customMochaReporterPath = require.resolve('../../fixture/customMochaReporter.js');

describe('loadUI', function () {
  it('should load built-in interface', function () {
    const ui = loadUI('tdd');
    assert.strictEqual(ui, 'tdd', 'should equal built-in ui');
  });

  it('should load interface from node_modules', function () {
    const ui = loadUI('mocha/lib/interfaces/tdd');
    assert.strictEqual(ui, require.resolve('mocha/lib/interfaces/tdd'), 'should equal node_module ui');
  });

  it('should load interface relative from real cwd (1)', function () {
    const ui = loadUI('./test/fixture/customMochaReporter', process.cwd());
    assert.strictEqual(ui, path.join(process.cwd(), './test/fixture/customMochaReporter.js'), 'should equal custom ui');
  });

  it('should load interface relative from real cwd (2)', function () {
    const ui = loadUI('test/fixture/customMochaReporter', process.cwd());
    assert.strictEqual(ui, path.join(process.cwd(), 'test/fixture/customMochaReporter.js'), 'should equal custom ui');
  });

  it('should load interface with relative path from custom cwd', function () {
    const ui = loadUI('../../fixture/customMochaReporter', __dirname);
    assert.strictEqual(ui, path.join(__dirname, '../../fixture/customMochaReporter.js'), 'should equal custom ui');
  });

  it('should load interface with absolute path', function () {
    const ui = loadUI(customMochaReporterPath, process.cwd());
    assert.strictEqual(ui, customMochaReporterPath, 'should equal custom ui');
  });

  it('throws error when not found', function () {
    const load = () => {
      loadUI('xxx/xxxx/xxxx/test.js', process.cwd());
    };

    assert.throws(load, /Cannot find module/);
  });
});
