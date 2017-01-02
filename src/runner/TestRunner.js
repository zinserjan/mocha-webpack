import path from 'path';
import _ from 'lodash';
import chokidar from 'chokidar';
import WebpackInfoPlugin from 'webpack-info-plugin';

import { glob } from '../util/glob';
import createCompiler from '../webpack/compiler/createCompiler';
import createWatchCompiler from '../webpack/compiler/createWatchCompiler';
import registerInMemoryCompiler from '../webpack/compiler/registerInMemoryCompiler';
import registerReadyCallback from '../webpack/compiler/registerReadyCallback';
import { EntryConfig, KEY as ENTRY_CONFIG_KEY } from '../webpack/loader/entryLoader';
import configureMocha from './configureMocha';
import getBuildStats from '../webpack/util/getBuildStats';

import type { MochaWebpackOptions } from '../MochaWebpack';
import type { BuildStats } from '../webpack/util/getBuildStats';
import type { WatchCompiler } from '../webpack/compiler/createWatchCompiler';
import type { Compiler, Stats } from '../webpack/types';

const entryPath = path.resolve(__dirname, '../entry.js');
const entryLoaderPath = path.resolve(__dirname, '../webpack/loader/entryLoader.js');
const includeLoaderPath = path.resolve(__dirname, '../webpack/loader/includeFilesLoader.js');
const noop = () => void 0;


type MochaRunner = {
  abort: () => void,
};
type Mocha = {
  run: (cb: (failures: number) => void) => MochaRunner,
};

export default class TestRunner {

  entries: Array<string>;
  includes: Array<string>;
  tmpPath: string;
  options: MochaWebpackOptions;
  outputFilePath: string;

  constructor(entries: Array<string>, includes: Array<String>, options: MochaWebpackOptions) {
    this.entries = entries;
    this.includes = includes;

    this.options = options;
    this.tmpPath = path.join(this.options.cwd, '.tmp', 'mocha-webpack');
    this.outputFilePath = path.join(this.tmpPath, 'bundle.js');
  }

  prepareMocha(webpackConfig: Object, stats: Stats): Mocha {
    const mocha: Mocha = configureMocha(this.options);
    const outputPath = webpackConfig.output.path;
    const buildStats: BuildStats = getBuildStats(stats, outputPath);

    global.__webpackManifest__ = buildStats.affectedModules; // eslint-disable-line

    // clear up require cache for changed files to make sure that we get the latest changes
    buildStats.affectedFiles.forEach((filePath) => {
      delete require.cache[filePath];
    });
    // pass webpack's entry files to mocha
    mocha.files = buildStats.entries;
    return mocha;
  }

  async run(): Promise<number> {
    const config = await this.createWebpackConfig();
    let dispose;
    let failures = 0;
    try {
      failures = await new Promise((resolve, reject) => {
        const compiler: Compiler = createCompiler(config);
        dispose = registerInMemoryCompiler(compiler);
        registerReadyCallback(compiler, (err?: Error, stats?: Stats) => {
          if (err) {
            reject(err);
            return;
          }
          const mocha = this.prepareMocha(config, stats);
          mocha.run(resolve);
        });
        compiler.run(noop);
      });
    } finally {
      // clean up single run
      if (typeof dispose === 'function') {
        dispose();
      }
    }
    return failures;
  }

  async watch(): void {
    const config = await this.createWebpackConfig();
    const entryConfig: EntryConfig = config[ENTRY_CONFIG_KEY];

    let runAgain = false;
    let mochaRunner: MochaRunner = null;
    let stats: Stats = null;

    const uncaughtExceptionListener = (err) => {
      // mocha catches uncaughtException only while tests are running,
      // that's why we register a custom error handler to keep this process alive
      console.error('An uncaught exception occurred: %s', err.message); // eslint-disable-line no-console
      console.error(err.stack); // eslint-disable-line no-console
    };

    const runMocha = () => {
      const mocha = this.prepareMocha(config, stats);
      runAgain = false;

      try {
        // unregister our custom exception handler (see declaration)
        process.removeListener('uncaughtException', uncaughtExceptionListener);

        // run tests
        mochaRunner = mocha.run(() => {
          // register custom exception handler to catch all errors that may happen after mocha think tests are done
          process.on('uncaughtException', uncaughtExceptionListener);

          // need to wait until next tick, otherwise mochaRunner = null doesn't work..
          process.nextTick(() => {
            mochaRunner = null;
            if (runAgain) {
              runMocha();
            }
          });
        });
      } catch (err) {
        console.error('An exception occurred while loading tests: %s', err.message); // eslint-disable-line no-console
        console.error(err.stack); // eslint-disable-line no-console
      }
    };

    const compiler = createCompiler(config);
    registerInMemoryCompiler(compiler);
    registerReadyCallback(compiler, (err?: Error, webpackStats?: Stats) => {
      if (err) {
        // wait for fixed tests
        return;
      }

      stats = webpackStats;
      runAgain = true;
      if (mochaRunner) {
        mochaRunner.abort();
        // make sure that the current running test will be aborted when timeouts are disabled for async tests
        if (mochaRunner.currentRunnable) {
          mochaRunner.currentRunnable.retries(0);
          mochaRunner.currentRunnable.enableTimeouts(true);
          mochaRunner.currentRunnable.timeout(1);
          mochaRunner.currentRunnable.resetTimeout(1);
        }
      } else {
        runMocha();
      }
    });

    const watchCompiler: WatchCompiler = createWatchCompiler(compiler, config.watchOptions);
    // start webpack build immediately
    watchCompiler.watch();

    // webpack enhances watch options, that's why we use them instead
    const watchOptions = watchCompiler.getWatchOptions();
    // create own file watcher for entry files to detect created or deleted files
    const watcher = chokidar.watch(this.entries, {
      cwd: this.options.cwd,
      // see https://github.com/webpack/watchpack/blob/e5305b53ac3cf2a70d49a772912b115fa77665c2/lib/DirectoryWatcher.js
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      ignorePermissionErrors: true,
      ignored: watchOptions.ignored,
      usePolling: watchOptions.poll ? true : undefined,
      interval: typeof watchOptions.poll === 'number' ? watchOptions.poll : undefined,
    });

    const restartWebpackBuild = _.debounce(() => watchCompiler.watch(), watchOptions.aggregateTimeout);
    const fileDeletedOrAdded = (file, deleted) => {
      const filePath = path.join(this.options.cwd, file);
      if (deleted) {
        entryConfig.removeFile(filePath);
      } else {
        entryConfig.addFile(filePath);
      }

      // pause webpack watch immediately before webpack will be notified
      watchCompiler.pause();
      // call debounced webpack runner to rebuild files
      restartWebpackBuild();
    };

    // add listener for entry creation & deletion events
    watcher.on('add', file => fileDeletedOrAdded(file, false));
    watcher.on('unlink', file => fileDeletedOrAdded(file, true));

    return new Promise(() => void 0); // never ending story
  }

  async createWebpackConfig(): {} {
    const webpackConfig = this.options.webpackConfig;

    const files = await glob(this.entries, {
      cwd: this.options.cwd,
      absolute: true,
    });

    const entryConfig = new EntryConfig();
    files.forEach((f) => entryConfig.addFile(f));

    const includeLoaderQuery = {
      include: this.includes,
    };

    const entry = `!!${includeLoaderPath}?${JSON.stringify(includeLoaderQuery)}!${entryLoaderPath}!${entryPath}`;

    const outputFileName = path.basename(this.outputFilePath);
    const outputPath = path.dirname(this.outputFilePath);

    const webpackInfoPlugin = new WebpackInfoPlugin({
      stats: {
        // pass options from http://webpack.github.io/docs/node.js-api.html#stats-tostring
        // context: false,
        hash: false,
        version: false,
        timings: false,
        assets: false,
        chunks: false,
        chunkModules: false,
        modules: false,
        children: false,
        cached: false,
        reasons: false,
        source: false,
        errorDetails: true,
        chunkOrigins: false,
        colors: this.options.colors,
      },
      state: false, // show bundle valid / invalid
    });

    const plugins = [
      webpackInfoPlugin,
    ];

    return {
      ...webpackConfig,
      [ENTRY_CONFIG_KEY]: entryConfig,
      entry,
      output: {
        ...webpackConfig.output,
        filename: outputFileName,
        path: outputPath,
      },
      plugins: [
        ...(webpackConfig.plugins || []),
        ...plugins,
      ],
    };
  }

}
