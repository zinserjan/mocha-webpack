import fs from 'fs';
import { existsFileSync } from '../util/exists';
import parseArgv from './parseArgv';

const config = 'mochawebpack.opts';

export default function parseConfig() {
  if (existsFileSync(config)) {
    const argv = fs.readFileSync(config, 'utf8')
      .replace(/\\\s/g, '%20')
      .split(/\s/)
      .filter(Boolean)
      .map((value) => value.replace(/%20/g, ' '));
    const defaultOptions = parseArgv(argv, true);
    delete defaultOptions.files; // ignoring files
    return defaultOptions;
  }
  return {};
}
