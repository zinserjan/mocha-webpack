/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import parseArgv from '../../src/cli/parseArgv';

describe('parseArgv', function () {
  beforeEach(function () {
    this.parseArgv = parseArgv;
    this.argv = [
      'src',
    ];
  });

  context('duplicated arguments', function () {
    it('should throw for non arrays', function () {
      // given
      const argv = ['--webpack-config', 'webpack-config.js', '--webpack-config', 'webpack-config2.js'];

      // when
      const fn = () => {
        this.parseArgv(argv);
      };

      // then
      assert.throws(fn, /Duplicating arguments for /);
    });

    it('should not throw for arrays', function () {
      // given
      const argv = ['--require', 'test', '--require', 'test2'];

      // when
      const fn = () => {
        this.parseArgv(argv);
      };

      // then
      assert.doesNotThrow(fn);
    });
  });

  context('ignore default options', function () {
    it('ignore default options when ignore=true', function () {
      assert.deepEqual(this.parseArgv([], true), {});
    });

    it('dont ignore default options when ignore=false', function () {
      assert.notDeepEqual(this.parseArgv([], false), {});
    });

    context('files must be parsed correctly', function () {
      it('options without values & file when ignore=false', function () {
        const argv = ['--recursive', 'test/bin/fixture'];

        const parsed = this.parseArgv(argv, false);

        assert.property(parsed, 'files');
        assert.deepEqual(parsed.files, ['test/bin/fixture']);
      });

      it('options without values & file when ignore=true', function () {
        const files = ['--recursive', 'test/bin/fixture'];
        assert.deepEqual(this.parseArgv(files, true), {
          recursive: true,
          files: ['test/bin/fixture'],
        });
      });

      it('options with values when ignore=true', function () {
        const argv = ['--webpack-config', 'webpack-config.js'];

        assert.deepEqual(this.parseArgv(argv, true), {
          webpackConfig: 'webpack-config.js',
        });
      });

      it('options with values & file when ignore=true', function () {
        const argv = ['--webpack-config', 'webpack-config.js', 'test/bin/fixture'];

        assert.deepEqual(this.parseArgv(argv, true), {
          webpackConfig: 'webpack-config.js',
          files: ['test/bin/fixture'],
        });
      });
    });
  });

  context('non-option as files', function () {
    it('uses "./test" as default', function () {
      // given
      const argv = [];

      // when
      const parsedArgv = this.parseArgv(argv);

      // then
      assert.property(parsedArgv, 'files');
      assert.deepEqual(parsedArgv.files, ['./test']);
    });

    it('parses non-options as files', function () {
      // given
      const argv = ['./test'];

      // when
      const parsedArgv = this.parseArgv(argv);

      // then
      assert.property(parsedArgv, 'files');
      assert.deepEqual(parsedArgv.files, argv);
    });
  });

  context('options', function () {
    context('async-only', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'asyncOnly', false);
      });

      for (const parameter of ['--async-only', '--A', '-A']) {
        it(`'parses ${parameter}'`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'asyncOnly', true);
        });
      }
    });

    context('colors', function () {
      it('uses undefined as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.notProperty(parsedArgv, 'colors');
      });


      for (const parameter of ['--colors', '--c', '-c']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'colors', true);
        });
      }


      for (const parameter of ['--no-colors', '--colors=false', '--no-c', '--c=false']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'colors', false);
        });
      }
    });

    context('growl', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'growl', false);
      });


      for (const parameter of ['--growl', '--G', '-G']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'growl', true);
        });
      }
    });

    context('recursive', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'recursive', false);
      });


      for (const parameter of ['--recursive']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'recursive', true);
        });
      }
    });

    context('reporter-options', function () {
      it('uses {} as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.property(parsedArgv, 'reporterOptions');
        assert.deepEqual(parsedArgv.reporterOptions, {});
      });

      const parameters = [
        { given: ['--reporter-options', 'foo=bar,quux'], expected: { foo: 'bar', quux: true } },
        { given: ['--reporter-options', 'foo=bar,quux,bar=foo'], expected: { foo: 'bar', quux: true, bar: 'foo' } },
        { given: ['--reporter-options', 'foo=bar,quux,bar=foo'], expected: { foo: 'bar', quux: true, bar: 'foo' } },
        { given: ['--O', 'foo=bar'], expected: { foo: 'bar' } },
        { given: ['-O', 'foo=bar'], expected: { foo: 'bar' } },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.property(parsedArgv, 'reporterOptions');
          assert.deepEqual(parsedArgv.reporterOptions, parameter.expected);
        });
      }
    });

    context('reporter', function () {
      it('uses "spec" as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'reporter', 'spec');
      });

      const parameters = [
        { given: ['--reporter', 'dot'], expected: 'dot' },
        { given: ['--R', 'dot'], expected: 'dot' },
        { given: ['-R', 'dot'], expected: 'dot' },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'reporter', parameter.expected);
        });
      }
    });

    context('bail', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'bail', false);
      });


      for (const parameter of ['--bail', '--b', '-b']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'bail', true);
        });
      }
    });

    context('grep', function () {
      it('has no default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.notProperty(parsedArgv, 'grep');
      });


      const parameters = [
        { given: ['--grep', 'test'], expected: 'test' },
        { given: ['--g', 'test'], expected: 'test' },
        { given: ['-g', 'test'], expected: 'test' },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'grep', parameter.expected);
        });
      }
    });

    context('fgrep', function () {
      it('has no default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.notProperty(parsedArgv, 'fgrep');
      });


      const parameters = [
        { given: ['--fgrep', 'test'], expected: 'test' },
        { given: ['--f', 'test'], expected: 'test' },
        { given: ['-f', 'test'], expected: 'test' },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'fgrep', parameter.expected);
        });
      }
    });

    context('invert', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'invert', false);
      });


      for (const parameter of ['--invert', '--i', '-i']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'invert', true);
        });
      }
    });

    context('require', function () {
      it('uses [] as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.property(parsedArgv, 'require');
        assert.deepEqual(parsedArgv.require, []);
      });


      const parameters = [
        { given: ['--require', 'test'], expected: ['test'] },
        { given: ['--require', 'test', '--require', 'test2'], expected: ['test', 'test2'] },
        { given: ['--r', 'test'], expected: ['test'] },
        { given: ['-r', 'test'], expected: ['test'] },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.property(parsedArgv, 'require');
          assert.deepEqual(parsedArgv.require, parameter.expected);
        });
      }
    });

    context('include', function () {
      it('uses [] as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.property(parsedArgv, 'include');
        assert.deepEqual(parsedArgv.include, []);
      });


      const parameters = [
        { given: ['--include', 'test'], expected: ['test'] },
        { given: ['--include', 'test', '--include', 'test2'], expected: ['test', 'test2'] },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.property(parsedArgv, 'include');
          assert.deepEqual(parsedArgv.include, parameter.expected);
        });
      }
    });

    context('slow', function () {
      it('uses 75 as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'slow', 75);
      });


      const parameters = [
        { given: ['--slow', '1000'], expected: 1000 },
        { given: ['--s', '1000'], expected: 1000 },
        { given: ['-s', '1000'], expected: 1000 },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'slow', parameter.expected);
        });
      }
    });

    context('timeout', function () {
      it('uses 2000 as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'timeout', 2000);
      });


      const parameters = [
        { given: ['--timeout', '1000'], expected: 1000 },
        { given: ['--t', '1000'], expected: 1000 },
        { given: ['-t', '1000'], expected: 1000 },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'timeout', parameter.expected);
        });
      }
    });

    context('ui', function () {
      it('uses "bdd" as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'ui', 'bdd');
      });


      const parameters = [
        { given: ['--ui', 'tdd'], expected: 'tdd' },
        { given: ['--u', 'tdd'], expected: 'tdd' },
        { given: ['-u', 'tdd'], expected: 'tdd' },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'ui', parameter.expected);
        });
      }
    });

    context('watch', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'watch', false);
      });


      for (const parameter of ['--watch', '--w', '-w']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'watch', true);
        });
      }
    });

    context('check-leaks', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'checkLeaks', false);
      });


      for (const parameter of ['--check-leaks']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'checkLeaks', true);
        });
      }
    });

    context('full-trace', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'fullTrace', false);
      });


      for (const parameter of ['--full-trace']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'fullTrace', true);
        });
      }
    });

    context('inline-diffs', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'inlineDiffs', false);
      });


      for (const parameter of ['--inline-diffs']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'inlineDiffs', true);
        });
      }
    });

    context('exit', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'exit', false);
      });


      for (const parameter of ['--exit']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'exit', true);
        });
      }
    });

    context('retries', function () {
      it('has no default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.notProperty(parsedArgv, 'retries');
      });


      const parameters = [
        { given: ['--retries', '2'], expected: 2 },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'retries', parameter.expected);
        });
      }
    });

    context('delay', function () {
      it('uses false as default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.propertyVal(parsedArgv, 'delay', false);
      });


      for (const parameter of ['--delay']) {
        it(`parses ${parameter}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat([parameter]);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'delay', true);
        });
      }
    });

    context('webpack-config', function () {
      it('has no default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.notProperty(parsedArgv, 'webpackConfig');
      });


      const parameters = [
        { given: ['--webpack-config', 'webpack-config.js'], expected: 'webpack-config.js' },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'webpackConfig', parameter.expected);
        });
      }
    });

    context('opts', function () {
      it('has no default value', function () {
        // given
        const argv = this.argv;

        // when
        const parsedArgv = this.parseArgv(argv);

        // then
        assert.notProperty(parsedArgv, 'opts');
      });


      const parameters = [
        { given: ['--opts', 'path/to/other.opts'], expected: 'path/to/other.opts' },
      ];

      for (const parameter of parameters) {
        it(`parses ${parameter.given.join(' ')}`, function () { // eslint-disable-line no-loop-func
          // given
          const argv = this.argv.concat(parameter.given);

          // when
          const parsedArgv = this.parseArgv(argv);

          // then
          assert.propertyVal(parsedArgv, 'opts', parameter.expected);
        });
      }
    });
  });
});
