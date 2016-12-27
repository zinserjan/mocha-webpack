import path from 'path';

import WebpackInfoPlugin from 'webpack-info-plugin';
import { glob } from '../util/glob';
import createInMemoryCompiler from '../webpack/compiler/createInMemoryCompiler';
import { EntryConfig, KEY as ENTRY_CONFIG_KEY } from '../webpack/loader/entryLoader';
import configureMocha from './configureMocha';
import type { MochaWebpackOptions } from '../MochaWebpack';
import getOutputChunks from '../webpack/util/getOutputChunks';
import getAffectedModuleIds from '../webpack/util/getAffectedModuleIds';
import type { OutputChunks } from '../webpack/util/getOutputChunks';
import type { Compilation, Stats } from '../webpack/types';

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
    const outputChunks: OutputChunks = getOutputChunks(stats.toJson(), outputPath);
    const compilation: Compilation = stats.compilation;
    const affectedModuleIds = getAffectedModuleIds(compilation.chunks, compilation.modules);

    global.__webpackManifest__ = affectedModuleIds; // eslint-disable-line

    // clear up require cache to make sure that we get the latest changes
    outputChunks.files.forEach((filePath) => {
      // todo only for really changed files
      delete require.cache[filePath];
    });
    // pass webpack's entry files to mocha
    mocha.files = outputChunks.entries;
    return mocha;
  }

  async run(): Promise<number> {
    const config = await this.createWebpackConfig();
    let compiler;
    let failures = 0;
    try {
      failures = await new Promise((resolve, reject) => {
        compiler = createInMemoryCompiler(config, (err, stats: Stats) => {
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
      if (typeof compiler !== 'undefined' && typeof compiler.mochaWebpackDispose === 'function') {
        compiler.mochaWebpackDispose();
      }
    }
    return failures;
  }

  async watch(): void {
    const config = await this.createWebpackConfig();

    let runAgain = false;
    let mochaRunner = null;
    let stats = null;

    const runMocha = () => {
      const mocha = this.prepareMocha(config, stats);
      runAgain = false;

      try {
        mochaRunner = mocha.run(() => {
          // need to wait until next tick, otherwise mochaRunner = null doesn't work..
          process.nextTick(() => {
            mochaRunner = null;
            if (runAgain) {
              runMocha();
            }
          });
        });
      } catch (e) {
        console.error(e.stack); // eslint-disable-line no-console
      }
    };

    const compiler = createInMemoryCompiler(config, (err, buildStats: Stats) => {
      if (err) {
        // wait for fixed tests
        return;
      }

      stats = buildStats;
      runAgain = true;
      if (mochaRunner) {
        mochaRunner.abort();
      } else {
        runMocha();
      }
    });

    const watchOptions = config.watchOptions || {};
    compiler.watch(watchOptions, noop);
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
