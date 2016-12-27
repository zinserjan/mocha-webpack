/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { exec } from 'child_process';
import normalizePath from 'normalize-path';


const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));

describe('code-splitting', function () {
  context('with static require', function () {
    before(function () {
      this.passingTest = normalizePath(path.join(fixtureDir, 'code-splitting/test/lazy-load-entry-static.js'));
      this.webpackConfig = normalizePath(path.join(fixtureDir, 'code-splitting/webpack.config-test.js'));
    });
    it('runs successfull test', function (done) {
      exec(`node ${binPath}  --webpack-config "${this.webpackConfig}" "${this.passingTest}"`, (err, stdout) => {
        assert.isNull(err);
        assert.include(stdout, 'entry1.js');
        assert.include(stdout, 'entry2.js');
        assert.include(stdout, '1 passing');
        done();
      });
    });
  });

  context('with dynamic require', function () {
    before(function () {
      this.passingTest = normalizePath(path.join(fixtureDir, 'code-splitting/test/lazy-load-entry-dynamic.js'));
      this.webpackConfig = normalizePath(path.join(fixtureDir, 'code-splitting/webpack.config-test.js'));
    });
    it('runs successfull test', function (done) {
      exec(`node ${binPath}  --webpack-config "${this.webpackConfig}" "${this.passingTest}"`, (err, stdout) => {
        assert.isNull(err);
        assert.include(stdout, 'entry1.js');
        assert.notInclude(stdout, 'entry2.js');
        assert.include(stdout, '1 passing');
        done();
      });
    });
  });

  context('without any require statements (empty require.ensure)', function () {
    before(function () {
      this.passingTest = normalizePath(path.join(fixtureDir, 'code-splitting/test/lazy-load-none.js'));
      this.webpackConfig = normalizePath(path.join(fixtureDir, 'code-splitting/webpack.config-test.js'));
    });
    it('runs successfull test', function (done) {
      exec(`node ${binPath}  --webpack-config "${this.webpackConfig}" "${this.passingTest}"`, (err, stdout) => {
        assert.isNull(err);
        assert.include(stdout, '1 passing');
        done();
      });
    });
  });
});
