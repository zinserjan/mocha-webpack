import path from 'path';

import WebpackInfoPlugin from 'webpack-info-plugin';

import { glob } from '../util/glob';
import createInMemoryCompiler from '../webpack/compiler/createInMemoryCompiler';
import InjectChangedModulesPlugin from '../webpack/plugin/InjectChangedModulesPlugin';
import { EntryConfig, KEY as ENTRY_CONFIG_KEY } from '../webpack/loader/entryLoader';
import type { MochaWebpackOptions } from '../MochaWebpack';
import configureMocha from './configureMocha';

const entryPath = path.resolve(__dirname, '../entry.js');
const entryLoaderPath = path.resolve(__dirname, '../webpack/loader/entryLoader.js');
const includeLoaderPath = path.resolve(__dirname, '../webpack/loader/includeFilesLoader.js');

const INJECT_CHANGED_MODULES_PLUGIN_KEY = Symbol('injectChangedModulesPlugin');
const noop = () => void 0;

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

  async run(cb: (failures: number) => void): void {
    const config = await this.createWebpackConfig();
    const mocha = configureMocha(this.options);

    const compiler = createInMemoryCompiler(config, (err) => {
      if (err) {
        cb(1);
        return;
      }
      mocha.files = [this.outputFilePath];
      mocha.run(cb);
    });

    compiler.run(noop);
  }

  async watch(): void {
    const config = await this.createWebpackConfig();
    const injectChangedModulesPlugin = config[INJECT_CHANGED_MODULES_PLUGIN_KEY];

    let runAgain = false;
    let mochaRunner = null;

    const runMocha = () => {
      // clear up require cache to reload test bundle
      delete require.cache[this.outputFilePath];

      const mocha = configureMocha(this.options);
      mocha.files = [this.outputFilePath];

      runAgain = false;

      try {
        mochaRunner = mocha.run((failures) => {
          injectChangedModulesPlugin.keepChanges(failures > 0);

          // need to wait until next tick, otherwise mochaRunner = null doesn't work..
          process.nextTick(() => {
            mochaRunner = null;
            if (runAgain) {
              runMocha();
            }
          });
        });
      } catch (e) {
        injectChangedModulesPlugin.keepChanges(true);
        console.error(e.stack); // eslint-disable-line no-console
      }
    };

    const compiler = createInMemoryCompiler(config, (err) => {
      if (err) {
        // wait for fixed tests
        return;
      }

      runAgain = true;
      if (mochaRunner) {
        mochaRunner.abort();
      } else {
        runMocha();
      }
    });

    const watchOptions = config.watchOptions || {};
    compiler.watch(watchOptions, noop);
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

    const injectChangedModulesPlugin = new InjectChangedModulesPlugin();
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
      injectChangedModulesPlugin,
      webpackInfoPlugin,
    ];

    return {
      ...webpackConfig,
      [ENTRY_CONFIG_KEY]: entryConfig,
      [INJECT_CHANGED_MODULES_PLUGIN_KEY]: injectChangedModulesPlugin,
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
