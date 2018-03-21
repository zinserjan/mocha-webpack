/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { assert } from 'chai';
import path from 'path';
import normalizePath from 'normalize-path';
import { exec } from './util/childProcess';


const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));

describe('webworker', function () {
  before(function () {
    this.passingTest = normalizePath(path.join(fixtureDir, 'webworker/test/worker.js'));
    this.webpackConfig = normalizePath(path.join(fixtureDir, 'webworker/webpack.config-test.js'));
  });
  it('runs test successfully', function (done) {
    exec(`node ${binPath}  --webpack-config "${this.webpackConfig}" "${this.passingTest}"`, (err, output) => {
      assert.isNull(err);
      assert.include(output, '1 passing');
      done();
    });
  });
});
