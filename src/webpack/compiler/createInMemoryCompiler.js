// @flow
import createCompiler from './createCompiler';
import registerInMemoryCompiler from './registerInMemoryCompiler';
import type { OutputChunks as Output } from '../util/getOutputChunks';
import type { Compiler } from '../types';

export default function createInMemoryCompiler(webpackConfig: {}, cb: (err: ?{}, output: Output) => void): Compiler {
  const compiler: Compiler = createCompiler(webpackConfig, cb);
  compiler.mochaWebpackDispose = registerInMemoryCompiler(compiler);
  return compiler;
}
