// @flow
import EventEmitter from 'events';
import chalk from 'chalk';
import type { Stats } from '../webpack/types';
import createStatsFormatter from '../webpack/util/createStatsFormatter';

type ReporterOptions = {
  eventEmitter: EventEmitter,
  interactive: boolean,
  quiet: boolean,
  cwd: string,
};

const log = (...args: Array<any>) => {
  console.log(...args); // eslint-disable-line no-console
  console.log();// eslint-disable-line no-console
};

const formatTitleInfo = (title) => chalk.inverse('', title, '');
const formatTitleWarn = (title) => chalk.black.bgYellow('', title, '');
const formatTitleError = (title) => chalk.white.bold.bgRed('', title, '');

class Reporter {
  added: Array<string>;
  removed: Array<string>;
  interactive: boolean;
  quiet: boolean;
  formatStats: (stats: Stats) => { warnings: Array<string>, errors: Array<string> };

  constructor(options: ReporterOptions) {
    const {
      eventEmitter, interactive, quiet, cwd,
    } = options;

    this.added = [];
    this.removed = [];
    this.interactive = interactive;
    this.quiet = quiet;
    this.formatStats = createStatsFormatter(cwd);

    eventEmitter.on('uncaughtException', this.onUncaughtException);
    eventEmitter.on('exception', this.onLoadingException);
    eventEmitter.on('webpack:start', this.onWebpackStart);
    eventEmitter.on('webpack:ready', this.onWebpackReady);
    eventEmitter.on('mocha:begin', this.onMochaStart);
    eventEmitter.on('mocha:aborted', this.onMochaAbort);
    eventEmitter.on('mocha:finished', this.onMochaReady);
    eventEmitter.on('entry:added', this.onEntryAdded);
    eventEmitter.on('entry:removed', this.onEntryRemoved);
  }

  logInfo(...args: Array<any>) {
    if (!this.quiet) {
      log(...args);
    }
  }

  clearConsole() {
    if (this.interactive) {
      process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
    }
  }

  static displayErrors(severity: string, errors: Array<any>) {
    const errorCount = errors.length;

    const message = severity === 'error' ?
      `Failed to compile with ${chalk.red(`${errorCount} ${severity}(s)`)}` :
      `Compiled with ${chalk.yellow(`${errorCount} ${severity}(s)`)}`;

    const titleColor = severity === 'error' ? formatTitleError : formatTitleWarn;
    log(titleColor('WEBPACK'), message);
    errors.forEach((err) => log(err));
  }

  onUncaughtException = (err: Error) => {
    log(formatTitleError('UNCAUGHT EXCEPTION'), 'Exception occurred after running tests');
    log(err.stack);
  };

  onLoadingException = (err: Error) => {
    log(formatTitleError('RUNTIME EXCEPTION'), 'Exception occurred while loading your tests');
    log(err.stack);
  };

  onWebpackStart = () => {
    this.clearConsole();
    if (this.added.length > 0) {
      this.logInfo(formatTitleInfo('MOCHA'), 'The following test entry files were added:');
      this.logInfo(this.added.map((f) => `+ ${f}`).join('\n'));
    }

    if (this.removed.length > 0) {
      this.logInfo(formatTitleInfo('MOCHA'), 'The following test entry files were removed:');
      this.logInfo(this.removed.map((f) => `- ${f}`).join('\n'));
    }

    this.logInfo(formatTitleInfo('WEBPACK'), 'Compiling...');

    this.added.length = 0;
    this.removed.length = 0;
  };

  onWebpackReady = (err?: Error, stats?: Stats) => {
    this.clearConsole();
    if (stats != null) {
      const { errors, warnings } = this.formatStats(stats);

      if (errors.length === 0 && warnings.length === 0) {
        const { startTime, endTime } = stats;
        const compileTime = endTime - startTime;
        this.logInfo(formatTitleInfo('WEBPACK'), `Compiled successfully in ${chalk.green(`${compileTime}ms`)}`);
        return;
      }

      if (errors.length > 0) {
        Reporter.displayErrors('error', errors);
        return;
      }

      if (warnings.length > 0) {
        Reporter.displayErrors('warning', warnings);
      }
    } else {
      Reporter.displayErrors('error', [err]);
    }
  };

  onMochaStart = () => {
    this.logInfo(formatTitleInfo('MOCHA'), 'Testing...');
  };

  onMochaAbort = () => {
    this.logInfo(formatTitleInfo('MOCHA'), 'Tests aborted');
  };

  onMochaReady = (failures: number) => {
    if (failures === 0) {
      this.logInfo(formatTitleInfo('MOCHA'), `Tests completed ${chalk.green('successfully')}`);
    } else {
      this.logInfo(formatTitleInfo('MOCHA'), `Tests completed with ${chalk.red(`${failures} failure(s)`)}`);
    }
  };

  onEntryAdded = (file: string) => {
    this.added.push(file);
  };

  onEntryRemoved = (file: string) => {
    this.removed.push(file);
  };
}

export default function testRunnerReporter(options: ReporterOptions) {
  new Reporter(options); // eslint-disable-line no-new
}
