// @flow
import chalk from 'chalk';
import { Stats } from '../webpack/types';

type ReporterOptions = {
  eventEmitter: {
    on: (event: string, callback: (...rest: Array<any>) => void) => void
  },
  interactive: boolean
};

const log = (...args: Array<any>) => {
  console.log(...args);
  console.log();
};
const logError = (...args: Array<any>) => {
  console.error(...args);
  log();
};

class Reporter {

  added: Array<string>;
  removed: Array<string>;
  interactive: boolean;

  constructor(options: ReporterOptions) {
    const { eventEmitter, interactive } = options;

    this.added = [];
    this.removed = [];
    this.interactive = interactive;

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

  clearConsole() {
    if (this.interactive) {
      process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
    }
  }

  displayErrors(severity: string, errors: Array<any>) {
    const errorCount = errors.length;

    const message = severity === 'error' ?
      `Failed to compile with ${chalk.red(`${errorCount} ${severity}(s)`)}` :
      `Compiled with ${chalk.yellow(`${errorCount} ${severity}(s)`)}`;

    const titleColor = severity === 'error' ? chalk.white.bold.bgRed : chalk.white.bold.bgYellow;
    log(titleColor('', 'WEBPACK', ''), message);
    errors.forEach((err) => logError(err));
  }

  onUncaughtException = (err: Error) => {
    log(chalk.white.bold.bgRed('', 'UNCAUGHT EXCEPTION', ''), 'Exception occurred after running tests');
    logError(err.stack);
  };

  onLoadingException = (err: Error) => {
    log(chalk.white.bold.bgRed('', 'RUNTIME EXCEPTION', ''), 'Exception occurred while loading your tests');
    logError(err.stack);
  };

  onWebpackStart = () => {
    this.clearConsole();
    if (this.added.length > 0) {
      log(chalk.inverse('', 'MOCHA', ''), 'The following test entry files were added:');
      log(this.added.map((f) => `+ ${f}`).join('\n'));
    }

    if (this.removed.length > 0) {
      log(chalk.inverse('', 'MOCHA', ''), 'The following test entry files were removed:');
      log(this.removed.map((f) => `- ${f}`).join('\n'));
    }

    log(chalk.inverse('', 'WEBPACK', ''), 'Compiling...');

    this.added.length = 0;
    this.removed.length = 0;
  };

  onWebpackReady = (err?: Error, stats?: Stats) => {
    this.clearConsole();
    if (stats != null) {
      const { errors, warnings } = stats.toJson({ errorDetails: false });

      if (errors.length === 0 && warnings.length === 0) {
        const { startTime, endTime } = stats;
        const compileTime = endTime - startTime;
        log(chalk.inverse('', 'WEBPACK', ''), `Compiled successfully in ${chalk.green(`${compileTime}ms`)}`);
        return;
      }

      if (errors.length > 0) {
        this.displayErrors('error', errors);
        return;
      }

      if (warnings.length > 0) {
        this.displayErrors('warning', warnings);
      }
    } else {
      this.displayErrors('error', [err]);
    }
  };

  onMochaStart = () => {
    log(chalk.inverse('', 'MOCHA', ''), 'Testing...');
  };

  onMochaAbort = () => {
    log(chalk.inverse('', 'MOCHA', ''), 'Tests aborted');
  };

  onMochaReady = (failures: number) => {
    if (failures === 0) {
      log(chalk.inverse('', 'MOCHA', ''), `Tests completed ${chalk.green('successfully')}`);
    } else {
      log(chalk.inverse('', 'MOCHA', ''), `Tests completed with ${chalk.red(`${failures} failure(s)`)}`);
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
