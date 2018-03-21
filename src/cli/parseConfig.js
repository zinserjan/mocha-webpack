import fs from 'fs';
import { existsFileSync } from '../util/exists';
import parseArgv from './parseArgv';

const defaultConfig = 'mocha-webpack.opts';

function handleMissingConfig(config) {
  if (config) {
    throw new Error(`Options file '${config}' not found`);
  }

  return {};
}

const createStripSurroundingChar = (c) => (s) => {
  if (s.indexOf(c) === 0 && s.lastIndexOf(c) === s.length - 1 && s.indexOf(c) !== s.lastIndexOf(c)) {
    return s.substring(1, s.length - 1);
  }
  return s;
};

const stripSingleQuotes = createStripSurroundingChar("'");
const stripDoubleQuotes = createStripSurroundingChar('"');

const removeSurroundingQuotes = (str) => {
  const stripped = stripDoubleQuotes(str);

  if (stripped !== str) {
    // strip only once
    return stripped;
  }
  return stripSingleQuotes(str);
};

export default function parseConfig(explicitConfig) {
  const config = explicitConfig || defaultConfig;

  if (!existsFileSync(config)) {
    return handleMissingConfig(explicitConfig);
  }

  const argv = fs.readFileSync(config, 'utf8')
    .replace(/\\\s/g, '%20')
    .split(/\s/)
    .filter(Boolean)
    .map((value) => value.replace(/%20/g, ' '))
    .map(removeSurroundingQuotes);
  const defaultOptions = parseArgv(argv, true);
  return defaultOptions;
}
