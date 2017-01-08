// @flow
import { EOL } from 'os';
import chalk from 'chalk';
import RequestShortener from 'webpack/lib/RequestShortener';
import { formatErrorMessage, stripLoaderFromPath } from './formatUtil';
import type { WebpackError, Stats, Compilation } from '../types';

const createGetFile = (requestShortener: RequestShortener) => (e: WebpackError): ?string => {
  /* istanbul ignore if */
  if (e.file) {
    // webpack does this also, so there must be case when this happens
    return e.file;
  } else if (e.module && e.module.readableIdentifier && typeof e.module.readableIdentifier === 'function') {
    // if we got a module, build a file path to the module without loader information
    return stripLoaderFromPath(e.module.readableIdentifier(requestShortener));
  }
  /* istanbul ignore next */
  return null;
};

// helper to transform strings in errors
const ensureWebpackErrors = (errors: Array<string | WebpackError>): Array<WebpackError> => errors
  .map((e: string | WebpackError) => {
    /* istanbul ignore if */
    if (typeof e === 'string') {
      // webpack does this also, so there must be case when this happens
      return {
        message: e,
      };
    }
    return e;
  });

const prependWarning = (message: string) => `${chalk.yellow('Warning')} ${message}`;
const prependError = (message: string) => `${chalk.red('Error')} ${message}`;

export default function createStatsFormatter(rootPath: string) {
  const requestShortener = new RequestShortener(rootPath);
  const getFile = createGetFile(requestShortener);

  const formatError = (err: WebpackError) => {
    const lines: Array<string> = [];

    const file = getFile(err);

    /* istanbul ignore else */
    if (file != null) {
      lines.push(`in ${chalk.underline(file)}`);
      lines.push('');
    } else {
      // no idea when this happens, just print 2 lines like file
      lines.push('');
      lines.push('');
    }

    lines.push(formatErrorMessage(err.message));

    return lines.join(EOL);
  };

  return function statsFormatter(stats: Stats) {
    const compilation: Compilation = stats.compilation;

    return {
      errors: ensureWebpackErrors(compilation.errors).map(formatError).map(prependError),
      warnings: ensureWebpackErrors(compilation.warnings).map(formatError).map(prependWarning),
    };
  };
}
