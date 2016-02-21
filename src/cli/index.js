import path from 'path';

import parseArgv from './parseArgv';
import prepareWebpack from './prepareWebpack';
import { run, watch } from './runner';
import { existsFileSync } from '../util/exists';

const options = parseArgv(process.argv.slice(2));

options.require.forEach((mod) => {
  const absolute = existsFileSync(mod) || existsFileSync(`${mod}.js`);
  const file = absolute ? path.resolve(mod) : mod;
  require(file);
});

if (options.webpackConfig) {
  const webpackConfigPath = path.resolve(options.webpackConfig);
  options.webpackConfig = require(webpackConfigPath);
} else {
  options.webpackConfig = {};
}

prepareWebpack(options, (err, webpackConfig) => {
  if (err) {
    throw err;
  } else if (options.watch) {
    watch(options, webpackConfig);
  } else {
    run(options, webpackConfig);
  }
});
