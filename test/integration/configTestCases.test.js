/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

// simplified version of https://github.com/webpack/webpack/blob/master/test/ConfigTestCases.test.js for testing webpack builds

import path from 'path';
import _ from 'lodash';
import fs from 'fs';
import vm from 'vm';
import Test from 'mocha/lib/test';
import webpack from 'webpack';

describe('ConfigTestCases', function () {
  const casesPath = path.join(__dirname, 'configCases');
  const tmpPath = path.join('.tmp', 'configCases');

  const categories = fs.readdirSync(casesPath).map((cat) => {
    const catPath = path.join(casesPath, cat);
    return {
      name: cat,
      tests: fs.readdirSync(catPath).filter((folder) => folder.indexOf('_') < 0).sort(),
    };
  });

  categories.forEach(function (category) {
    describe(category.name, function () {
      category.tests.forEach(function (testName) {
        const suite = describe(testName, function () {});
        it(`${testName} should compile`, function (done) {
          this.timeout(30000);
          const testDirectory = path.join(casesPath, category.name, testName);
          const outputDirectory = path.join(tmpPath, category.name, testName);
          // eslint-disable-next-line global-require
          const options = require(path.join(testDirectory, 'webpack.config.js'));
          const optionsArr = [].concat(options).map((opts, idx) => _.defaults(opts, {
            context: testDirectory,
            entry: './index.js',
            target: 'async-node',
            output: {
              path: outputDirectory,
              filename: `bundle${idx}.js`,
              chunkFilename: `[id].bundle${idx}.js`,
            },
          }));

          webpack(options, function (err) {
            if (err) {
              return done(err);
            }

            function testIt(title, fn) {
              const test = new Test(title, fn);
              suite.addTest(test);
              return test;
            }

            function customRequire(module) {
              if (/^\.\.?\//.test(module)) {
                const p = path.join(outputDirectory, module);
                const fnStr = `(function(require, module, exports, __dirname, __filename, it) { ${fs.readFileSync(p, 'utf-8')} \n})`;
                const fn = vm.runInThisContext(fnStr, p);

                const mdl = {
                  exports: {},
                };
                fn.call(mdl.exports, customRequire, mdl, module.exports, outputDirectory, p, testIt);
                return mdl.exports;
              }
              // eslint-disable-next-line global-require
              return require(module);
            }

            const findBundle = function (idx, opts) {
              const bundleName = `bundle${idx}.js`;
              if (fs.existsSync(path.join(opts.output.path, bundleName))) {
                return `./${bundleName}`;
              }
              return undefined;
            };

            optionsArr.forEach((opts, idx) => {
              const bundlePath = findBundle(idx, opts);
              if (bundlePath) {
                customRequire(bundlePath);
              }
            });

            // give a free pass to compilation that generated an error
            process.nextTick(done);
            return undefined;
          });
        });
      });
    });
  });
});
