/* eslint-disable */
const path = require('path');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'node',
  output: {
    filename: 'bundle-custom-output-path.js',
    path: path.join(__dirname,  '../../fixtureTmp'),
    publicPath: ''
  },
  plugins: [
    new WriteFilePlugin(),
  ],
};
