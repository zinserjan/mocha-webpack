import invariant from 'invariant';
import _ from 'lodash';
import webpack from 'webpack';

export default function createCompiler(webpackConfig, cb) {
  invariant(arguments.length === 2, 'parameters are missing');
  invariant(_.isPlainObject(webpackConfig), 'webpackConfig must be a plain object');
  invariant(_.isFunction(cb), 'cb must be a function');

  const compiler = webpack(webpackConfig);

  compiler.plugin('failed', cb);
  compiler.plugin('done', (stats) => {
    if (stats.hasErrors()) {
      const jsonStats = stats.toJson();
      const [err] = jsonStats.errors;
      cb(err);
    } else {
      cb();
    }
  });
  return compiler;
}
