/* eslint-env node, mocha */

import path from 'path';
import { assert } from 'chai';
import loadWebpackConig from '../../src/cli/loadWebpackConfig';

describe('loadWebpackConfig', () => {
  const getConfigPath = extension =>
    path.join(__dirname, 'fixture', 'webpackConfig', `webpack.config-test${extension}`);

  const expectedConfigPath = path.join(__dirname, 'fixture', 'webpackConfig', 'expected.json');
  const expectedConfig = require(expectedConfigPath); // eslint-disable-line global-require

  it('load plain JavaScript Webpack config file', () => {
    const configPath = getConfigPath('.js');
    assert.deepEqual(loadWebpackConig(configPath), expectedConfig);
  });

  it('load Babel Webpack config file', () => {
    const configPath = getConfigPath('.babel.js');
    assert.deepEqual(loadWebpackConig(configPath), expectedConfig);
  });

  it('load CoffeeScript Webpack config file', () => {
    const configPath = getConfigPath('.coffee');
    assert.deepEqual(loadWebpackConig(configPath), expectedConfig);
  });
});
