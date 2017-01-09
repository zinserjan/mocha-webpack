/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import { assert } from 'chai';
import MochaWebpack from '../../src/MochaWebpack';

describe('MochaWebpack', function () {
  it('should create a instance of MochaWebpack', function () {
    assert.doesNotThrow(() => new MochaWebpack());
    const mochaWebpack = new MochaWebpack();

    assert.isNotNull(mochaWebpack);
  });

  it('has some default options', function () {
    const mochaWebpack = new MochaWebpack();
    assert.isObject(mochaWebpack.options);

    const expected = {
      cwd: process.cwd(),
      webpackConfig: {},
      bail: false,
      reporter: 'spec',
      reporterOptions: {},
      ui: 'bdd',
      invert: false,
      ignoreLeaks: true,
      fullStackTrace: false,
      useInlineDiffs: false,
      timeout: 2000,
      slow: 75,
      asyncOnly: false,
      delay: false,
      interactive: !!(process.stdout.isTTY),
    };
    assert.deepEqual(mochaWebpack.options, expected);
  });

  it('has a list of entries', function () {
    const mochaWebpack = new MochaWebpack();
    assert.isArray(mochaWebpack.entries);
    assert.lengthOf(mochaWebpack.entries, 0);
  });

  it('has a list of includes', function () {
    const mochaWebpack = new MochaWebpack();
    assert.isArray(mochaWebpack.includes);
    assert.lengthOf(mochaWebpack.includes, 0);
  });


  context('methods', function () {
    beforeEach(function () {
      this.mochaWebpack = new MochaWebpack();
    });

    it('addEntry()', function () {
      const oldEntries = this.mochaWebpack.entries;
      const entry = './test.js';

      const returnValue = this.mochaWebpack.addEntry(entry);

      assert.include(this.mochaWebpack.entries, entry, 'entry should be added');
      assert.notStrictEqual(this.mochaWebpack.entries, oldEntries, 'addEntry() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('addInclude()', function () {
      const oldIncludes = this.mochaWebpack.includes;
      const entry = './test.js';

      const returnValue = this.mochaWebpack.addInclude(entry);

      assert.include(this.mochaWebpack.includes, entry, 'entry should be added');
      assert.notStrictEqual(this.mochaWebpack.includes, oldIncludes, 'addInclude() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('cwd()', function () {
      const oldOptions = this.mochaWebpack.options;
      const cwd = __dirname;

      const returnValue = this.mochaWebpack.cwd(cwd);

      assert.propertyVal(this.mochaWebpack.options, 'cwd', cwd, 'cwd should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'cwd() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('webpackConfig()', function () {
      const oldOptions = this.mochaWebpack.options;
      const webpackConfig = {
        loaders: [],
      };

      const returnValue = this.mochaWebpack.webpackConfig(webpackConfig);

      assert.propertyVal(this.mochaWebpack.options, 'webpackConfig', webpackConfig, 'webpackConfig should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'webpackConfig() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('bail()', function () {
      const oldOptions = this.mochaWebpack.options;
      const bail = true;

      const returnValue = this.mochaWebpack.bail(bail);

      assert.propertyVal(this.mochaWebpack.options, 'bail', bail, 'bail should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'bail() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('reporter()', function () {
      const oldOptions = this.mochaWebpack.options;
      const reporter = 'test';
      const reporterOptions = {
        foo: 'bar',
      };

      const returnValue = this.mochaWebpack.reporter(reporter, reporterOptions);

      assert.propertyVal(this.mochaWebpack.options, 'reporter', reporter, 'reporter should be changed');
      assert.propertyVal(this.mochaWebpack.options, 'reporterOptions', reporterOptions, 'reporterOptions should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'reporter() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('ui()', function () {
      const oldOptions = this.mochaWebpack.options;
      const ui = 'tdd';

      const returnValue = this.mochaWebpack.ui(ui);

      assert.propertyVal(this.mochaWebpack.options, 'ui', ui, 'ui should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'reporter() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('fgrep()', function () {
      const oldOptions = this.mochaWebpack.options;
      const fgrep = 'fgrep';

      const returnValue = this.mochaWebpack.fgrep(fgrep);

      assert.propertyVal(this.mochaWebpack.options, 'fgrep', fgrep, 'fgrep should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'fgrep() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('grep()', function () {
      const oldOptions = this.mochaWebpack.options;
      const grep = 'grep';

      const returnValue = this.mochaWebpack.grep(grep);

      assert.propertyVal(this.mochaWebpack.options, 'grep', grep, 'grep should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'grep() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('invert()', function () {
      const oldOptions = this.mochaWebpack.options;

      const returnValue = this.mochaWebpack.invert();

      assert.propertyVal(this.mochaWebpack.options, 'invert', true, 'invert should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'invert() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('ignoreLeaks()', function () {
      const oldOptions = this.mochaWebpack.options;
      const ignoreLeaks = false;

      const returnValue = this.mochaWebpack.ignoreLeaks(ignoreLeaks);

      assert.propertyVal(this.mochaWebpack.options, 'ignoreLeaks', ignoreLeaks, 'ignoreLeaks should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'ignoreLeaks() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('fullStackTrace()', function () {
      const oldOptions = this.mochaWebpack.options;
      const fullStackTrace = true;

      const returnValue = this.mochaWebpack.fullStackTrace(fullStackTrace);

      assert.propertyVal(this.mochaWebpack.options, 'fullStackTrace', fullStackTrace, 'fullStackTrace should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'fullStackTrace() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('useColors()', function () {
      const oldOptions = this.mochaWebpack.options;
      const colors = false;

      const returnValue = this.mochaWebpack.useColors(colors);

      assert.propertyVal(this.mochaWebpack.options, 'colors', colors, 'colors should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'useColors() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('useInlineDiffs()', function () {
      const oldOptions = this.mochaWebpack.options;
      const useInlineDiffs = true;

      const returnValue = this.mochaWebpack.useInlineDiffs(useInlineDiffs);

      assert.propertyVal(this.mochaWebpack.options, 'useInlineDiffs', useInlineDiffs, 'useInlineDiffs should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'useInlineDiffs() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('timeout()', function () {
      const oldOptions = this.mochaWebpack.options;
      const timeout = 150;

      const returnValue = this.mochaWebpack.timeout(timeout);

      assert.propertyVal(this.mochaWebpack.options, 'timeout', timeout, 'timeout should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'timeout() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('retries()', function () {
      const oldOptions = this.mochaWebpack.options;
      const retries = 150;

      const returnValue = this.mochaWebpack.retries(retries);

      assert.propertyVal(this.mochaWebpack.options, 'retries', retries, 'retries should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'retries() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('slow()', function () {
      const oldOptions = this.mochaWebpack.options;
      const slow = 150;

      const returnValue = this.mochaWebpack.slow(slow);

      assert.propertyVal(this.mochaWebpack.options, 'slow', slow, 'slow should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'slow() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('asyncOnly()', function () {
      const oldOptions = this.mochaWebpack.options;

      const returnValue = this.mochaWebpack.asyncOnly();

      assert.propertyVal(this.mochaWebpack.options, 'asyncOnly', true, 'asyncOnly should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'asyncOnly() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('delay()', function () {
      const oldOptions = this.mochaWebpack.options;

      const returnValue = this.mochaWebpack.delay();

      assert.propertyVal(this.mochaWebpack.options, 'delay', true, 'delay should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'delay() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('interactive()', function () {
      const oldOptions = this.mochaWebpack.options;
      const oldValue = oldOptions.interactive;
      const newValue = !oldValue;

      const returnValue = this.mochaWebpack.interactive(newValue);

      assert.propertyVal(this.mochaWebpack.options, 'interactive', newValue, 'interactive should be changed');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'interactive() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });

    it('growl()', function () {
      const oldOptions = this.mochaWebpack.options;
      const oldValue = oldOptions.growl;
      assert.isNotOk(oldValue, 'growl should be falsy');

      const returnValue = this.mochaWebpack.growl();

      assert.propertyVal(this.mochaWebpack.options, 'growl', true, 'growl should be changed to true');
      assert.notStrictEqual(this.mochaWebpack.options, oldOptions, 'growl() should not mutate');
      assert.strictEqual(returnValue, this.mochaWebpack, 'api should be chainable');
    });
  });
});
