// @flow
import { error, success, log, info, note, warn, clear } from '../util/log';
import { Stats } from '../webpack/types';

type ReporterOptions = {
  eventEmitter: {
    on: (event: string, callback: (...rest: Array<any>) => void) => void
  },
  interactive: boolean
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
      clear();
    }
  }

  displayErrors(severity: string, errors: Array<any>) {
    const errorCount = errors.length;

    const subtitle = severity === 'error' ?
      `Failed to compile with ${errorCount} ${severity}(s)` :
      `Compiled with ${errorCount} ${severity}(s)`;

    const logger = severity === 'error' ? error : warn;

    logger('WEBPACK', subtitle);
    errors.forEach((err) => log(err));
  }

  onUncaughtException = (err: Error) => {
    warn('UNCAUGHT EXCEPTION', err.message);
    log(err.stack);
    note('Exception occurred after running tests maybe due to an failed async operation.');
  };

  onLoadingException = (err: Error) => {
    error('EXCEPTION', err.message);
    log(err.stack);
    note('Exception occurred while loading tests.');
  };

  onWebpackStart = () => {
    this.clearConsole();
    if (this.added.length > 0) {
      info('The following test entry files were added:');
      log(this.added.map((f) => `+ ${f}`).join('\n'));
    }

    if (this.removed.length > 0) {
      info('The following test entry files were removed:');
      log(this.removed.map((f) => `- ${f}`).join('\n'));
    }

    info('Compiling...');

    this.added.length = 0;
    this.removed.length = 0;
  };

  onWebpackReady = (err?: Error, stats?: Stats) => {
    this.clearConsole();
    if (stats != null) {
      // const { errors, warnings } = stats.toJson({}, true);

      const { errors, warnings } = stats.toJson({ errorDetails: false });

      if (errors.length === 0 && warnings.length === 0) {
        const { startTime, endTime } = stats;
        const compileTime = endTime - startTime;
        success('WEBPACK', `Compiled successfully in ${compileTime}ms`);
        return;
      }

      if (errors.length > 0) {
        this.displayErrors('error', errors);
        return;
      }

      if (warnings.length > 0) {
        this.displayErrors('warning', errors);
      }
    } else {
      this.displayErrors('error', [err]);
    }
  };

  onMochaStart = () => {
    info('Testing...');
  };

  onMochaAbort = () => {
    info('Testing aborted.');
  };

  onMochaReady = (failures: number) => {
    if (failures === 0) {
      success('MOCHA', 'Tests completed successfully.');
    } else {
      warn('MOCHA', `Tests completed with ${failures} failure(s).`);
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
