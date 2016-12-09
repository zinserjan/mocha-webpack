/* eslint-env node, mocha */

import path from 'path';
import { assert } from 'chai';
import requireWebpackConfig from '../../../src/cli/requireWebpackConfig';

describe('requireWebpackConfig', () => {
  const getConfigPath = extension =>
    path.join(__dirname, 'fixture', 'webpackConfig', `webpack.config-test${extension}`);

  const expectedConfigPath = path.join(__dirname, 'fixture', 'webpackConfig', 'expected.json');
  const expectedConfig = require(expectedConfigPath); // eslint-disable-line global-require

  it('requires plain JavaScript Webpack config file', () => {
    const configPath = getConfigPath('.js');
    assert.deepEqual(requireWebpackConfig(configPath), expectedConfig);
  });

  it('requires Babel Webpack config file', () => {
    const configPath = getConfigPath('.babel.js');
    assert.deepEqual(requireWebpackConfig(configPath), expectedConfig);
  });

  it('requires CoffeeScript Webpack config file', () => {
    const configPath = getConfigPath('.coffee');
    assert.deepEqual(requireWebpackConfig(configPath), expectedConfig);
  });
});
