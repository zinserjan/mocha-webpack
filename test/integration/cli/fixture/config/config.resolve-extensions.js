/* eslint-disable */

// webpack resolve.extensions changed with webpack 2
// an empty string is no longer allowed, but webpack 1 needs that..
var webpackVersion = require('webpack/package.json').version;
var webpackV1 = webpackVersion.startsWith('1');
var defaultExtensions = ['.ts', '.tsx', '.js', '.jsx'];
var extensions = webpackV1 ? defaultExtensions.concat('') : defaultExtensions;

module.exports = {
  resolve: {
    extensions: extensions,
  },
};
