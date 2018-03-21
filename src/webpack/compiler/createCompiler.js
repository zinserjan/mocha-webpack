// @flow
import webpack from 'webpack';
import type { Compiler } from '../types';

export default function createCompiler(webpackConfig: {}): Compiler {
  const compiler = webpack(webpackConfig);

  return compiler;
}
