// @flow
import path from 'path';
import { interfaces } from 'mocha';

export default function loadUI(ui: string, cwd: string) {
  // try to load built-in ui like 'bdd'
  if (typeof interfaces[ui] !== 'undefined') {
    return ui;
  }

  let loadedUI = null;
  try {
    // try to load reporter from node_modules
    loadedUI = require.resolve(ui); // eslint-disable-line global-require
  } catch (e) {
    // try to load reporter from cwd
    loadedUI = require.resolve(path.resolve(cwd, ui)); // eslint-disable-line global-require
  }
  return loadedUI;
}
