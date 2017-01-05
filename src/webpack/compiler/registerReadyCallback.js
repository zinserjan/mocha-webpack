// @flow
import type { Compiler, Stats } from '../types';

export default function registerReadyCallback(compiler: Compiler, cb: (err: ?{}, stats: Stats) => void): Compiler {
  compiler.plugin('failed', cb);
  compiler.plugin('done', (stats) => {
    if (stats.hasErrors()) {
      const jsonStats = stats.toJson();
      const [err] = jsonStats.errors;
      cb(err, stats);
    } else {
      cb(null, stats);
    }
  });
}
