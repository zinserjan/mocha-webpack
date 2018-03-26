import path from 'path';
import _ from 'lodash';

import parseArgv from './parseArgv';
import { existsFileSync } from '../util/exists';
import parseConfig from './parseConfig';
import requireWebpackConfig from './requireWebpackConfig';
import { ensureGlob, extensionsToGlob } from '../util/glob';
import createMochaWebpack from '../createMochaWebpack';


function resolve(mod) {
  const absolute = existsFileSync(mod) || existsFileSync(`${mod}.js`);
  const file = absolute ? path.resolve(mod) : mod;
  return file;
}

function exit(lazy, code) {
  if (lazy) {
    process.on('exit', () => {
      process.exit(code);
    });
  } else {
    process.exit(code);
  }
}

const cliOptions = parseArgv(process.argv.slice(2), true);
const configOptions = parseConfig(cliOptions.opts);
const requiresWebpackConfig = cliOptions.webpackConfig != null || configOptions.webpackConfig != null;
const defaultOptions = parseArgv([]);

const options = _.defaults({}, cliOptions, configOptions, defaultOptions);

options.require.forEach((mod) => {
  require(resolve(mod)); // eslint-disable-line global-require, import/no-dynamic-require
});

options.include = options.include.map(resolve);

options.webpackConfig = requireWebpackConfig(
  options.webpackConfig,
  requiresWebpackConfig,
  options.webpackEnv,
  options.mode,
);

const mochaWebpack = createMochaWebpack();

options.include.forEach((f) => mochaWebpack.addInclude(f));

const extensions = _.get(options.webpackConfig, 'resolve.extensions', ['.js']);
const fallbackFileGlob = extensionsToGlob(extensions);
const fileGlob = options.glob != null ? options.glob : fallbackFileGlob;

options.files.forEach((f) => mochaWebpack.addEntry(ensureGlob(f, options.recursive, fileGlob)));

mochaWebpack.cwd(process.cwd());
mochaWebpack.webpackConfig(options.webpackConfig);
mochaWebpack.bail(options.bail);
mochaWebpack.reporter(options.reporter, options.reporterOptions);
mochaWebpack.ui(options.ui);
mochaWebpack.interactive(options.interactive);

if (options.fgrep) {
  mochaWebpack.fgrep(options.fgrep);
}

if (options.grep) {
  mochaWebpack.grep(options.grep);
}

if (options.invert) {
  mochaWebpack.invert();
}

if (options.checkLeaks) {
  mochaWebpack.ignoreLeaks(false);
}

if (options.fullTrace) {
  mochaWebpack.fullStackTrace();
}

if (options.quiet) {
  mochaWebpack.quiet();
}

mochaWebpack.useColors(options.colors);
mochaWebpack.useInlineDiffs(options.inlineDiffs);
mochaWebpack.timeout(options.timeout);

if (options.retries) {
  mochaWebpack.retries(options.retries);
}

mochaWebpack.slow(options.slow);

if (options.asyncOnly) {
  mochaWebpack.asyncOnly();
}

if (options.delay) {
  mochaWebpack.delay();
}

if (options.growl) {
  mochaWebpack.growl();
}

Promise
  .resolve()
  .then(() => {
    if (options.watch) {
      return mochaWebpack.watch();
    }
    return mochaWebpack.run();
  })
  .then((failures) => {
    exit(options.exit, failures);
  })
  .catch((e) => {
    if (e) {
      console.error(e.stack); // eslint-disable-line
    }
    exit(options.exit, 1);
  });
