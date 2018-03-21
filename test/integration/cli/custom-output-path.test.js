/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, max-len */
import { assert } from 'chai';
import path from 'path';
import fs from 'fs';
import del from 'del';
import normalizePath from 'normalize-path';
import { exec } from './util/childProcess';

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));

describe('custom output path', function () {
  before(function () {
    this.passingTest = normalizePath(path.join(fixtureDir, 'custom-output-path/test/test.js'));
    this.webpackConfigPath = normalizePath(path.join(fixtureDir, 'custom-output-path/webpack.config-test.js'));
    this.webpackConfig = require('./fixture/custom-output-path/webpack.config-test.js'); // eslint-disable-line global-require
  });

  beforeEach(function () {
    return del(this.webpackConfig.output.path);
  });

  it('runs test successfully', function (done) {
    exec(`node ${binPath}  --webpack-config "${this.webpackConfigPath}" "${this.passingTest}"`, (err, output) => {
      assert.isNull(err);
      assert.include(output, '1 passing');
      assert.isTrue(fs.existsSync(path.join(this.webpackConfig.output.path, this.webpackConfig.output.filename)));
      done();
    });
  });

  afterEach(function () {
    return del(this.webpackConfig.output.path);
  });
});
