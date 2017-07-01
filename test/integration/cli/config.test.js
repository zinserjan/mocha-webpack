/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */

import { assert } from 'chai';
import path from 'path';
import { exec } from 'child_process';

const fixtureDir = path.relative(process.cwd(), path.join(__dirname, 'fixture'));
const binPath = path.relative(process.cwd(), path.join('bin', '_mocha'));
const testSimple = path.join(fixtureDir, 'simple/simple.js');

describe('cli --webpack-config', function () {
  it('does not throw for missing default config', function (done) {
    exec(`node ${binPath} "${testSimple}"`, (err) => {
      assert.isNull(err);
      done();
    });
  });

  it('throws when not found', function (done) {
    const configNotFound = 'xxxxxxx.js';
    exec(`node ${binPath} --webpack-config ${configNotFound} "${testSimple}"`, (err) => {
      assert.include(err.message, `Webpack config could not be found: ${configNotFound}`);
      done();
    });
  });
});
