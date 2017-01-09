// @flow
import loaderUtils from 'loader-utils';
import createEntry from '../util/createEntry';

const KEY = Symbol('entryConfig');

class EntryConfig {

  files: Array<string>;

  constructor() {
    this.files = [];
  }

  addFile(file: string): void {
    this.files.push(file);
  }

  removeFile(file: string): void {
    this.files = this.files.filter((f) => f !== file);
  }

  getFiles(): Array<string> {
    return this.files;
  }

}

const entryLoader = function entryLoader() {
  const config: EntryConfig = this.options[KEY];

  // Remove all dependencies of the loader result
  this.clearDependencies();

  const dependencies: Array<string> = config
    .getFiles()
    .map((file) => loaderUtils.stringifyRequest(this, file));

  // add all entries as dependencies
  dependencies.forEach(this.addDependency.bind(this));

  // build source code
  const sourceCode: string = createEntry(dependencies);

  this.callback(null, sourceCode, null);
};


module.exports = entryLoader;
module.exports.KEY = KEY;
module.exports.EntryConfig = EntryConfig;

