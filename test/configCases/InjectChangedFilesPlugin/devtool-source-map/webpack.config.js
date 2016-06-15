import InjectChangedFilesPlugin from '../../../../src/webpack/InjectChangedFilesPlugin';

module.exports = {
  plugins: [
    new InjectChangedFilesPlugin(),
  ],
  devtool: '#source-map',
};
