// @flow
import path from 'path';
import { reporters } from 'mocha';

export default function loadReporter(reporter: string | () => void, cwd: string) {
  // if reporter is already loaded, just return it
  if (typeof reporter === 'function') {
    return reporter;
  }

  // try to load built-in reporter like 'spec'
  if (typeof reporters[reporter] !== 'undefined') {
    return reporters[reporter];
  }

  let loadedReporter = null;
  try {
    // try to load reporter from node_modules
    loadedReporter = require(reporter); // eslint-disable-line global-require
  } catch (e) {
    // try to load reporter from cwd
    loadedReporter = require(path.resolve(cwd, reporter)); // eslint-disable-line global-require
  }
  return loadedReporter;
}
