import InjectChangedModulesPlugin from '../../../../src/webpack/plugin/InjectChangedModulesPlugin';

module.exports = {
  plugins: [
    new InjectChangedModulesPlugin(),
  ],
  devtool: '#eval-source-map',
};
