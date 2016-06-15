import InjectChangedFilesPlugin from '../../../../src/webpack/InjectChangedFilesPlugin';

module.exports = {
  plugins: [
    new InjectChangedFilesPlugin(),
  ],
  devtool: '#cheap-module-source-map',
};
