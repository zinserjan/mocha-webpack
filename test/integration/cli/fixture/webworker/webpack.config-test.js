/* eslint-disable */
global.Worker = require('tiny-worker'); // webworker polyfill for node
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'node',
  plugins: [
    new WriteFilePlugin({
      test: /\.worker\.js$/,
    }),
  ],
};
