import InjectChangedModulesPlugin from '../../../../../src/webpack/plugin/InjectChangedModulesPlugin';

module.exports = {
  plugins: [
    new InjectChangedModulesPlugin(),
  ],
  devtool: '#cheap-eval-source-map',
};
