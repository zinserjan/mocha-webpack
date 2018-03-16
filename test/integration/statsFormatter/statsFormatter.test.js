/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import fs from 'fs-extra';
import path from 'path';

import _ from 'lodash';
import stripAnsi from 'strip-ansi';
import webpack from 'webpack';
import { version as WEBPACK_VERSION } from 'webpack/package.json';
import MemoryFileSystem from 'memory-fs';
import { assert } from 'chai';
import createStatsFormatter from '../../../src/webpack/util/createStatsFormatter';
const webpackMajorVersion = WEBPACK_VERSION.charAt(0);

const base = path.join(__dirname, 'statsCasesFixture');
const tests = fs.readdirSync(base).filter((testName) => fs.existsSync(path.join(base, testName, 'entry.js')));
const jsonLoaderPath = path.resolve(__dirname, './mock/json-loader.js');

const webpackConfig = {
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['babel-preset-env'],
        },
      },
      {
        test: /.json$/,
        loader: jsonLoaderPath,
      },
      {
        test: /\.css$/,
        loaders: ['css-loader'],
      },
      {
        test: /\.scss$/,
        loaders: ['sass-loader'],
      },
    ],
  },
};

describe('statFormatter', function () {
  before(function () {
    if (process.platform === 'win32') {
      this.skip();
    }
  });

  tests.forEach((testName) => {
    const testDirPath = path.join(base, testName);
    const entryPath = path.join(testDirPath, 'entry.js');

    // make os & location independent messages without colors
    const ensureConsistentCompare = _.flow([
      stripAnsi,
      (message) => message.replace(/\r?\n/g, '\n'),
      (message) => message.replace(testDirPath, `Xdir/${testName}`),
    ]);

    it(`should print correct stats for ${path.basename(testDirPath)}`, function (done) {
      const formatter = createStatsFormatter(testDirPath);
      assert.isFunction(formatter, 'createStatsFormatter should return a function');

      const config = {
        ...webpackConfig,
        context: testDirPath,
        entry: `./${path.basename(entryPath)}`,
      };

      const memoryFs = new MemoryFileSystem();

      const compiler = webpack(config);
      compiler.outputFileSystem = memoryFs;

      compiler.run((err, stats) => {
        if (err) {
          done(err);
          return;
        }

        const { warnings, errors } = formatter(stats);

        assert.isArray(warnings, 'statsFormatter should return an Array of warnings');
        assert.lengthOf(warnings, stats.compilation.warnings.length, 'Length of warnings should match original length');
        assert.isArray(errors, 'statsFormatter should return an Array of errors');
        assert.lengthOf(errors, stats.compilation.errors.length, 'Length of errors should match original length');


        const warningsContent = ensureConsistentCompare(warnings.join('\n'));
        const errorsContent = ensureConsistentCompare(errors.join('\n'));

        const expectedWarningsPath = path.join(testDirPath, `warnings.webpack-${webpackMajorVersion}.txt`);
        const expectedErrorsPath = path.join(testDirPath, `errors.webpack-${webpackMajorVersion}.txt`);

        if (!fs.existsSync(expectedWarningsPath) || !fs.existsSync(expectedErrorsPath)) {
          fs.outputFileSync(expectedWarningsPath, warningsContent);
          fs.outputFileSync(expectedErrorsPath, errorsContent);

          done(new Error('Expected files did not exist, yet. Created it. Have a look at them'));
          return;
        }

        const expectedWarningsContent = ensureConsistentCompare(fs.readFileSync(expectedWarningsPath, 'utf-8'));
        const expectedErrorsContent = ensureConsistentCompare(fs.readFileSync(expectedErrorsPath, 'utf-8'));

        assert.strictEqual(warningsContent, expectedWarningsContent, 'Warnings should match');
        assert.strictEqual(errorsContent, expectedErrorsContent, 'Errors should match');

        done();
      });
    });
  });
});
