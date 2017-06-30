/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import { assert } from 'chai';
import { sandbox } from 'sinon';
import Mocha from 'mocha';

import configureMocha from '../../../src/runner/configureMocha';


describe('configureMocha', function () {
  beforeEach(function () {
    this.options = {
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
    };
    this.sandbox = sandbox.create();
    this.spyReporter = this.sandbox.spy(Mocha.prototype, 'reporter');
    this.spyUseColors = this.sandbox.spy(Mocha.prototype, 'useColors');
    this.spyUseInlineDiffs = this.sandbox.spy(Mocha.prototype, 'useInlineDiffs');
    this.spyEnableTimeouts = this.sandbox.spy(Mocha.prototype, 'enableTimeouts');
    this.spyGrep = this.sandbox.spy(Mocha.prototype, 'grep');
    this.spyGrowl = this.sandbox.spy(Mocha.prototype, 'growl');
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it('should create a instance of Mocha', function () {
    const mocha = configureMocha(this.options);
    assert.instanceOf(mocha, Mocha, 'configureMocha should return a instance of Mocha');
  });

  it('should call reporter()', function () {
    configureMocha({
      ...this.options,
    });

    const reporter = Mocha.reporters[this.options.reporter];

    assert.isTrue(this.spyReporter.called, 'reporter() should be called');
    assert.isTrue(this.spyReporter.calledWith(reporter, this.options.reporterOptions));
  });

  it('should call useColors()', function () {
    configureMocha({
      ...this.options,
    });

    assert.isTrue(this.spyUseColors.called, 'useColors() should be called');
    assert.isTrue(this.spyUseColors.calledWith(this.options.colors));
  });

  it('should call useInlineDiffs()', function () {
    configureMocha({
      ...this.options,
    });

    assert.isTrue(this.spyUseInlineDiffs.called, 'useInlineDiffs() should be called');
    assert.isTrue(this.spyUseInlineDiffs.calledWith(this.options.useInlineDiffs));
  });

  it('should call enableTimeouts()', function () {
    configureMocha({
      ...this.options,
      timeout: 0,
    });

    assert.isTrue(this.spyEnableTimeouts.called, 'enableTimeouts() should be called');
    assert.isTrue(this.spyEnableTimeouts.calledWith(false));
  });

  it('should call grep()', function () {
    configureMocha({
      ...this.options,
      grep: 'dddd',
      fgrep: 'dddd',
    });

    assert.isTrue(this.spyGrep.calledTwice, 'grep() should be called');
  });

  it('should set growl', function () {
    configureMocha({
      ...this.options,
      growl: undefined,
    });

    assert.isFalse(this.spyGrowl.called, 'growl() should not be called');

    configureMocha({
      ...this.options,
      growl: true,
    });

    assert.isTrue(this.spyGrowl.called, 'growl() should be called');
  });
});
