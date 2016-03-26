import fs from 'fs';
import { existsFileSync } from '../util/exists';
import parseArgv from './parseArgv';

export default function parseConfig(config) {
  if (existsFileSync(config)) {
    const argv = fs.readFileSync(config, 'utf8')
      .replace(/\\\s/g, '%20')
      .split(/\s/)
      .filter(Boolean)
      .map((value) => value.replace(/%20/g, ' '));
    const defaultOptions = parseArgv(argv, true);
    return defaultOptions;
  }
  return {};
}
