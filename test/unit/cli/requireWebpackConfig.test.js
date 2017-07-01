/* eslint-env node, mocha */

import path from 'path';
import { assert } from 'chai';
import requireWebpackConfig from '../../../src/cli/requireWebpackConfig';

describe('requireWebpackConfig', () => {
  const getConfigPath = (extension, suffix = 'config-test') =>
    path.join(__dirname, 'fixture', 'webpackConfig', `webpack.${suffix}${extension}`);

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

  it('requires CoffeeScript Webpack config file with config.js', () => {
    const configPath = getConfigPath('.js', 'config');
    assert.deepEqual(requireWebpackConfig(configPath), expectedConfig);
  });

  it('supports config that exports a function', () => {
    const configPath = getConfigPath('.js', 'config-function');
    assert.deepEqual(requireWebpackConfig(configPath), expectedConfig);
  });

  it('throws error when multi compiler config is given', () => {
    const configPath = getConfigPath('.js', 'config-multi');
    const error = 'Passing multiple configs as an Array is not supported. Please provide a single config instead.';
    assert.throws(() => requireWebpackConfig(configPath, true), error);
  });

  it('throws error when not found when required', () => {
    const configPath = getConfigPath('.js', 'config-xxx');
    assert.throws(() => requireWebpackConfig(configPath, true), /Webpack config could not be found/);
  });

  it('return empty config when not found and not required', () => {
    const configPath = getConfigPath('.xxx', 'config-xxx');
    assert.deepEqual(requireWebpackConfig(configPath), {});
  });
});
