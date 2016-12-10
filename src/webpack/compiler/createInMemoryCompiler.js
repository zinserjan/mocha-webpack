// @flow
import createCompiler from './createCompiler';
import registerInMemoryCompiler from './registerInMemoryCompiler';
import type { Compiler } from '../types';

export default function createInMemoryCompiler(webpackConfig: {}, cb: (err: ?{}) => void): Compiler {
  const compiler: Compiler = createCompiler(webpackConfig, cb);
  registerInMemoryCompiler(compiler);
  return compiler;
}
