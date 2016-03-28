import fs from 'fs';
import { existsFileSync } from '../util/exists';
import parseArgv from './parseArgv';

const defaultConfig = 'mocha-webpack.opts';

function handleMissingConfig(config) {
  if (config === defaultConfig) {
    return {};
  }

  throw new Error(`Options file '${config}' not found`);
}

export default function parseConfig(config = defaultConfig) {
  if (!existsFileSync(config)) {
    return handleMissingConfig(config);
  }

  const argv = fs.readFileSync(config, 'utf8')
    .replace(/\\\s/g, '%20')
    .split(/\s/)
    .filter(Boolean)
    .map((value) => value.replace(/%20/g, ' '));
  const defaultOptions = parseArgv(argv, true);
  return defaultOptions;
}
