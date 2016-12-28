// @flow
import webpack from 'webpack';
import type { Compiler, Stats } from '../types';

export default function createCompiler(webpackConfig: {}, cb: (err: ?{}, stats: Stats) => void): Compiler {
  const compiler = webpack(webpackConfig);

  compiler.plugin('failed', cb);
  compiler.plugin('done', (stats) => {
    if (stats.hasErrors()) {
      const jsonStats = stats.toJson();
      const [err] = jsonStats.errors;
      cb(err, null);
    } else {
      cb(null, stats);
    }
  });

  return compiler;
}
