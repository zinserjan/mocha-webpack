// @flow
import webpack from 'webpack';
import type { Compiler, Stats } from '../types';

type Config = {
  output: {
    path: string,
    filename: string,
  }
};

export default function createCompiler(webpackConfig: Config, cb: (err: ?{}, stats: Stats) => void): Compiler {
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
