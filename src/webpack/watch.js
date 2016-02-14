import _ from 'lodash';
import createCompiler from './createCompiler';

export default function watch(webpackConfig, cb) {
  const compiler = createCompiler(webpackConfig, cb);
  compiler.watch({}, _.noop);
}
