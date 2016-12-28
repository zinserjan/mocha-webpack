// @flow
import createCompiler from './createCompiler';
import registerInMemoryCompiler from './registerInMemoryCompiler';
import type { Compiler, Stats } from '../types';

export default function createInMemoryCompiler(webpackConfig: {}, cb: (err: ?{}, stats: Stats) => void): Compiler {
  const compiler: Compiler = createCompiler(webpackConfig, cb);
  compiler.mochaWebpackDispose = registerInMemoryCompiler(compiler);
  return compiler;
}
