// @flow
import { EOL } from 'os';
import _ from 'lodash';

const syntaxErrorLabel = 'Syntax error:';

// we replace all EOL combinations with \n and replace to work in a consistent way
const replaceEol = (message) => message.replace(/\r?\n/g, '\n');
// undo eol replacements
const useValidEol = (message: string) => message.replace('\n', EOL);

// strip stacks for module builds as they are useless and just show what happened inside the loader
// strip at ... ...:x:y
const stripStackTrace = (message: string) => message.replace(/^\s*at\s.*\(.+\)\n?/gm, '');

const cleanUpModuleNotFoundMessage = (message: string) => {
  if (message.indexOf('Module not found:') === 0) {
    return message
      .replace('Cannot resolve \'file\' or \'directory\' ', '')
      .replace('Cannot resolve module ', '')
      .replace('Error: Can\'t resolve ', '')
      .replace('Error: ', '');
  }
  return message;
};

const cleanUpBuildError = (message: string) => {
  if (message.indexOf('Module build failed:') === 0) {
    // check if first line of message just contains 'Module build failed: '
    if (/Module build failed:\s*$/.test(message.split('\n')[0])) {
      const lines = message.split('\n');
      let replacement = lines[0];

      // try to detect real type of build error
      if (/File to import not found or unreadable/.test(message)) {
        // sass-loader file not found -> module not found
        replacement = 'Module not found:';
      } else if (/Invalid CSS/.test(message)) {
        // sass-loader css error -> syntax error
        replacement = syntaxErrorLabel;
      }

      lines[0] = replacement;
      message = lines.join('\n'); // eslint-disable-line no-param-reassign
    }

    return message
      .replace('Module build failed: SyntaxError:', syntaxErrorLabel) // babel-loader error
      .replace('Module build failed:', ''); // otherwise remove it as it's already clear that this is an module error
  }
  return message;
};

// removes new line characters at the end of message
const cleanUpUnwantedEol = (message) => message.replace(/\s*\n\s*$/, '');

// indent all lines by 2 spaces
const indent = (message: string) => message.split('\n').map((l) => `  ${l}`).join('\n');

// gets executed from top to bottom
export const formatErrorMessage: (message: string) => string = _.flow([
  replaceEol,
  stripStackTrace,
  cleanUpModuleNotFoundMessage,
  cleanUpBuildError,
  cleanUpUnwantedEol,
  indent,
  useValidEol,
]);

export const stripLoaderFromPath = (file: string) => {
  // Remove webpack-specific loader notation from filename.
  // Before:
  // ../mocha-webpack/lib/webpack/loader/entryLoader.js!../mocha-webpack/lib/entry.js
  // After:
  // ../mocha-webpack/lib/entry.js
  if (file.lastIndexOf('!') !== -1) {
    return file.substr(file.lastIndexOf('!') + 1);
  }
  return file;
};

