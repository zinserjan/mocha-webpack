// @flow
import TestRunner from './runner/TestRunner';
import testRunnerReporter from './runner/testRunnerReporter';

export type MochaWebpackOptions = {
  cwd: string,
  webpackConfig: {},
  bail: boolean,
  reporter: string | () => void,
  reporterOptions: {},
  ui: string,
  fgrep?: string,
  grep?: string | RegExp,
  invert: boolean,
  ignoreLeaks: boolean,
  fullStackTrace: boolean,
  colors?: boolean,
  useInlineDiffs: boolean,
  timeout: number,
  retries?: number,
  slow: number,
  asyncOnly: boolean,
  delay: boolean,
  interactive: boolean,
  quiet: boolean,
  growl?: boolean,
};

export default class MochaWebpack {
  /**
   * Files to run test against
   *
   * @private
   */
  entries: Array<string> = [];
  /**
   * Files to include into the bundle
   *
   * @private
   */
  includes: Array<string> = [];
  /**
   * Options
   *
   * @private
   */
  options: MochaWebpackOptions = {
    cwd: process.cwd(),
    webpackConfig: {},
    bail: false,
    reporter: 'spec',
    reporterOptions: {},
    ui: 'bdd',
    invert: false,
    ignoreLeaks: true,
    fullStackTrace: false,
    useInlineDiffs: false,
    timeout: 2000,
    slow: 75,
    asyncOnly: false,
    delay: false,
    interactive: !!((process.stdout: any).isTTY),
    quiet: false,
  };

  /**
   * Add file run test against
   *
   * @public
   * @param {string} file file or glob
   * @return {MochaWebpack}
   */
  addEntry(file: string): MochaWebpack {
    this.entries = [
      ...this.entries,
      file,
    ];
    return this;
  }

  /**
   * Add file to include into the test bundle
   *
   * @public
   * @param {string} file absolute path to module
   * @return {MochaWebpack}
   */
  addInclude(file: string): MochaWebpack {
    this.includes = [
      ...this.includes,
      file,
    ];
    return this;
  }

  /**
   * Sets the current working directory
   *
   * @public
   * @param {string} cwd absolute working directory path
   * @return {MochaWebpack}
   */
  cwd(cwd: string): MochaWebpack {
    this.options = {
      ...this.options,
      cwd,
    };
    return this;
  }

  /**
   * Sets the webpack config
   *
   * @public
   * @param {Object} config webpack config
   * @return {MochaWebpack}
   */
  webpackConfig(config: {} = {}): MochaWebpack {
    this.options = {
      ...this.options,
      webpackConfig: config,
    };
    return this;
  }

  /**
   * Enable or disable bailing on the first failure.
   *
   * @public
   * @param {boolean} [bail]
   * @return {MochaWebpack}
   */
  bail(bail: boolean = false): MochaWebpack {
    this.options = {
      ...this.options,
      bail,
    };
    return this;
  }

  /**
   * Set reporter to `reporter`, defaults to "spec".
   *
   * @param {string|Function} reporter name or constructor
   * @param {Object} reporterOptions optional options
   * @return {MochaWebpack}
   */
  reporter(reporter: string | () => void, reporterOptions: {}): MochaWebpack {
    this.options = {
      ...this.options,
      reporter,
      reporterOptions,
    };
    return this;
  }

  /**
   * Set test UI, defaults to "bdd".
   *
   * @public
   * @param {string} ui bdd/tdd
   * @return {MochaWebpack}
   */
  ui(ui: string): MochaWebpack {
    this.options = {
      ...this.options,
      ui,
    };
    return this;
  }

  /**
   * Only run tests containing <string>
   *
   * @public
   * @param {string} str
   * @return {MochaWebpack}
   */
  fgrep(str: string): MochaWebpack {
    this.options = {
      ...this.options,
      fgrep: str,
    };
    return this;
  }

  /**
   * Only run tests matching <pattern>
   *
   * @public
   * @param {string|RegExp} pattern
   * @return {MochaWebpack}
   */
  grep(pattern: string | RegExp): MochaWebpack {
    this.options = {
      ...this.options,
      grep: pattern,
    };
    return this;
  }

  /**
   * Invert `.grep()` matches.
   *
   * @public
   * @return {MochaWebpack}
   */
  invert(): MochaWebpack {
    this.options = {
      ...this.options,
      invert: true,
    };
    return this;
  }

  /**
   * Ignore global leaks.
   *
   * @public
   * @param {boolean} ignore
   * @return {MochaWebpack}
   */
  ignoreLeaks(ignore: boolean): MochaWebpack {
    this.options = {
      ...this.options,
      ignoreLeaks: ignore,
    };
    return this;
  }

  /**
   * Display long stack-trace on failing
   *
   * @public
   * @return {MochaWebpack}
   */
  fullStackTrace(): MochaWebpack {
    this.options = {
      ...this.options,
      fullStackTrace: true,
    };
    return this;
  }

  /**
   * Emit color output.
   *
   * @public
   * @param {boolean} colors
   * @return {MochaWebpack}
   */
  useColors(colors: boolean): MochaWebpack {
    this.options = {
      ...this.options,
      colors,
    };
    return this;
  }

  /**
   * Quiet informational messages.
   *
   * @public
   * @return {MochaWebpack}
   */
  quiet(): MochaWebpack {
    this.options = {
      ...this.options,
      quiet: true,
    };
    return this;
  }

  /**
   * Use inline diffs rather than +/-.
   *
   * @public
   * @param {boolean} inlineDiffs
   * @return {MochaWebpack}
   */
  useInlineDiffs(inlineDiffs: boolean): MochaWebpack {
    this.options = {
      ...this.options,
      useInlineDiffs: inlineDiffs,
    };
    return this;
  }

  /**
   * Set the timeout in milliseconds. Value of 0 disables timeouts
   *
   * @public
   * @param {number} timeout time in ms
   * @return {MochaWebpack}
   */
  timeout(timeout: number): MochaWebpack {
    this.options = {
      ...this.options,
      timeout,
    };
    return this;
  }

  /**
   * Set the number of times to retry failed tests.
   *
   * @public
   * @param {number} count retry times
   * @return {MochaWebpack}
   */
  retries(count: number): MochaWebpack {
    this.options = {
      ...this.options,
      retries: count,
    };
    return this;
  }


  /**
   * Set slowness threshold in milliseconds.
   *
   * @public
   * @param {number} threshold time in ms
   * @return {MochaWebpack}
   */
  slow(threshold: number): MochaWebpack {
    this.options = {
      ...this.options,
      slow: threshold,
    };
    return this;
  }

  /**
   * Makes all tests async (accepting a callback)
   *
   * @public
   * @return {MochaWebpack}
   */
  asyncOnly(): MochaWebpack {
    this.options = {
      ...this.options,
      asyncOnly: true,
    };
    return this;
  }

  /**
   * Delay root suite execution.
   *
   * @public
   * @return {MochaWebpack}
   */
  delay(): MochaWebpack {
    this.options = {
      ...this.options,
      delay: true,
    };
    return this;
  }

  /**
   * Force interactive mode (default enabled in terminal)
   *
   * @public
   * @param {boolean} interactive
   * @return {MochaWebpack}
   */
  interactive(interactive: boolean): MochaWebpack {
    this.options = {
      ...this.options,
      interactive,
    };
    return this;
  }

  /**
   * Enable growl notification support
   *
   * @public
   * @param {boolean} growl
   * @return {MochaWebpack}
   */
  growl(): MochaWebpack {
    this.options = {
      ...this.options,
      growl: true,
    };
    return this;
  }

  /**
   * Run tests
   *
   * @public
   * @return {Promise<number>} a Promise that gets resolved with the number of failed tests or rejected with build error
   */
  async run(): Promise<number> {
    const runner = new TestRunner(this.entries, this.includes, this.options);
    testRunnerReporter({
      eventEmitter: runner,
      interactive: this.options.interactive,
      quiet: this.options.quiet,
      cwd: this.options.cwd,
    });
    return runner.run();
  }

  /**
   * Run tests and rerun them on changes
   * @public
   */
  async watch(): Promise<void> {
    const runner = new TestRunner(this.entries, this.includes, this.options);
    testRunnerReporter({
      eventEmitter: runner,
      interactive: this.options.interactive,
      quiet: this.options.quiet,
      cwd: this.options.cwd,
    });
    await runner.watch();
  }
}
