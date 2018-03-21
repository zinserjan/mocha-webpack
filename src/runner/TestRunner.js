// @flow
import path from 'path';
import EventEmitter from 'events';
import _ from 'lodash';
import chokidar from 'chokidar';

import { glob } from '../util/glob';
import { ensureAbsolutePath } from '../util/paths';
import createCompiler from '../webpack/compiler/createCompiler';
import createWatchCompiler from '../webpack/compiler/createWatchCompiler';
import registerInMemoryCompiler from '../webpack/compiler/registerInMemoryCompiler';
import registerReadyCallback from '../webpack/compiler/registerReadyCallback';
// $FlowFixMe
import { EntryConfig } from '../webpack/loader/entryLoader';
import configureMocha from './configureMocha';
import getBuildStats from '../webpack/util/getBuildStats';
import buildProgressPlugin from '../webpack/plugin/buildProgressPlugin';

import type { MochaWebpackOptions } from '../MochaWebpack';
import type { BuildStats } from '../webpack/util/getBuildStats';
import type { WatchCompiler } from '../webpack/compiler/createWatchCompiler';
import type { Compiler, Stats } from '../webpack/types';

const entryPath = path.resolve(__dirname, '../entry.js');
const entryLoaderPath = path.resolve(__dirname, '../webpack/loader/entryLoader.js');
const includeLoaderPath = path.resolve(__dirname, '../webpack/loader/includeFilesLoader.js');
const noop = () => undefined;


type MochaRunner = {
  abort: () => void,
  currentRunnable?: {
    retries: (count: number) => void,
    enableTimeouts: (enabled: boolean) => void,
    timeout: (ms: number) => void,
    resetTimeout: (ms: number) => void,
  }
};
type Mocha = {
  run: (cb: (failures: number) => void) => MochaRunner,
};

export default class TestRunner extends EventEmitter {
  entries: Array<string>;
  includes: Array<string>;
  options: MochaWebpackOptions;

  constructor(entries: Array<string>, includes: Array<string>, options: MochaWebpackOptions) {
    super();
    this.entries = entries;
    this.includes = includes;

    this.options = options;
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
    (mocha: any).files = buildStats.entries;
    return mocha;
  }

  async run(): Promise<number> {
    const { webpackConfig: config } = await this.createWebpackConfig();
    let failures = 0;
    const compiler: Compiler = createCompiler(config);

    compiler.hooks.run.tapAsync('mocha-webpack', (c, cb) => {
      this.emit('webpack:start');
      // $FlowFixMe
      cb();
    });

    const dispose = registerInMemoryCompiler(compiler);
    try {
      failures = await new Promise((resolve, reject) => {
        registerReadyCallback(compiler, (err: ?(Error | string), webpackStats: ?Stats) => {
          this.emit('webpack:ready', err, webpackStats);
          if (err || !webpackStats) {
            reject();
            return;
          }
          try {
            const mocha = this.prepareMocha(config, webpackStats);
            this.emit('mocha:begin');
            try {
              mocha.run((fails) => {
                this.emit('mocha:finished', fails);
                resolve(fails);
              });
            } catch (e) {
              this.emit('exception', e);
              resolve(1);
            }
          } catch (e) {
            reject(e);
          }
        });
        compiler.run(noop);
      });
    } finally {
      // clean up single run
      dispose();
    }
    return failures;
  }

  async watch(): Promise<void> {
    const { webpackConfig: config, entryConfig } = await this.createWebpackConfig();

    let mochaRunner: ?MochaRunner = null;
    let stats: ?Stats = null;
    let compilationScheduler: ?() => void = null;

    const uncaughtExceptionListener = (err) => {
      // mocha catches uncaughtException only while tests are running,
      // that's why we register a custom error handler to keep this process alive
      this.emit('uncaughtException', err);
    };

    const runMocha = () => {
      try {
        // $FlowFixMe
        const mocha = this.prepareMocha(config, stats);
        // unregister our custom exception handler (see declaration)
        process.removeListener('uncaughtException', uncaughtExceptionListener);

        // run tests
        this.emit('mocha:begin');
        mochaRunner = mocha.run(_.once((failures) => {
          // register custom exception handler to catch all errors that may happen after mocha think tests are done
          process.on('uncaughtException', uncaughtExceptionListener);

          // need to wait until next tick, otherwise mochaRunner = null doesn't work..
          process.nextTick(() => {
            mochaRunner = null;
            if (compilationScheduler != null) {
              this.emit('mocha:aborted');
              compilationScheduler();
              compilationScheduler = null;
            } else {
              this.emit('mocha:finished', failures);
            }
          });
        }));
      } catch (err) {
        this.emit('exception', err);
      }
    };

    const compiler = createCompiler(config);
    registerInMemoryCompiler(compiler);
    // register webpack start callback
    compiler.hooks.watchRun.tapAsync('mocha-webpack', (c, cb) => {
      // check if mocha tests are still running, abort them and start compiling
      if (mochaRunner) {
        compilationScheduler = () => {
          this.emit('webpack:start');
          // $FlowFixMe
          cb();
        };

        mochaRunner.abort();
        // make sure that the current running test will be aborted when timeouts are disabled for async tests
        if (mochaRunner.currentRunnable) {
          const runnable = mochaRunner.currentRunnable;
          runnable.retries(0);
          runnable.enableTimeouts(true);
          runnable.timeout(1);
          runnable.resetTimeout(1);
        }
      } else {
        this.emit('webpack:start');
        // $FlowFixMe
        cb();
      }
    });
    // register webpack ready callback
    registerReadyCallback(compiler, (err: ?(Error | string), webpackStats: ?Stats) => {
      this.emit('webpack:ready', err, webpackStats);
      if (err) {
        // wait for fixed tests
        return;
      }
      stats = webpackStats;
      runMocha();
    });

    const watchCompiler: WatchCompiler = createWatchCompiler(compiler, (config: any).watchOptions);
    // start webpack build immediately
    watchCompiler.watch();

    // webpack enhances watch options, that's why we use them instead
    const watchOptions = watchCompiler.getWatchOptions();
    const pollingInterval = typeof watchOptions.poll === 'number' ? watchOptions.poll : undefined;
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
      interval: pollingInterval,
      binaryInterval: pollingInterval,
    });

    const restartWebpackBuild = _.debounce(() => watchCompiler.watch(), watchOptions.aggregateTimeout);
    const fileDeletedOrAdded = (file, deleted) => {
      const filePath = path.join(this.options.cwd, file);
      if (deleted) {
        this.emit('entry:removed', file);
        entryConfig.removeFile(filePath);
      } else {
        this.emit('entry:added', file);
        entryConfig.addFile(filePath);
      }

      // pause webpack watch immediately before webpack will be notified
      watchCompiler.pause();
      // call debounced webpack runner to rebuild files
      restartWebpackBuild();
    };

    // add listener for entry creation & deletion events
    watcher.on('add', (file) => fileDeletedOrAdded(file, false));
    watcher.on('unlink', (file) => fileDeletedOrAdded(file, true));

    return new Promise(() => undefined); // never ending story
  }

  async createWebpackConfig() {
    const { webpackConfig } = this.options;

    const files = await glob(this.entries, {
      cwd: this.options.cwd,
      absolute: false, // this option isn't covered by the version range in 'globby' for 'glob' (default value is false)
    });

    const entryConfig = new EntryConfig();
    files
      .map((f) => ensureAbsolutePath(f, this.options.cwd))
      .forEach((f) => entryConfig.addFile(f));

    const tmpPath = path.join(this.options.cwd, '.tmp', 'mocha-webpack', Date.now().toString());
    const withCustomPath = _.has(webpackConfig, 'output.path');
    const outputPath = path.normalize(_.get(webpackConfig, 'output.path', tmpPath));
    const publicPath = withCustomPath ? _.get(webpackConfig, 'output.publicPath', undefined) : outputPath + path.sep;

    const plugins = [];

    if (this.options.interactive) {
      plugins.push(buildProgressPlugin());
    }

    const userLoaders = _.get(webpackConfig, 'module.rules', []);
    userLoaders.unshift({
      test: entryPath,
      use: [
        {
          loader: includeLoaderPath,
          options: {
            include: this.includes,
          },
        },
        {
          loader: entryLoaderPath,
          options: {
            entryConfig,
          },
        },
      ],
    });

    const config = {
      ...webpackConfig,
      entry: entryPath,
      module: {
        ...(webpackConfig: any).module,
        rules: userLoaders,
      },
      output: {
        ...(webpackConfig: any).output,
        path: outputPath,
        publicPath,
      },
      plugins: [
        ...((webpackConfig: any).plugins || []),
        ...plugins,
      ],
    };
    return {
      webpackConfig: config,
      entryConfig,
    };
  }
}
