// @flow
import ConcatSource from 'webpack-sources/lib/ConcatSource';
import getAffectedModuleIds from '../util/getAffectedModuleIds';

import type { Compiler, Compilation } from '../types';

export default class InjectChangedModulesPlugin {

  changedIds: Array<number>;
  keepIds: boolean;

  constructor() {
    this.changedIds = [];
    this.keepIds = false;
  }

  keepChanges(value: boolean) {
    this.keepIds = value;
  }

  apply(compiler: Compiler) {
    compiler.plugin('this-compilation', (compilation: Compilation) => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        // keep last ids when necessary
        const lastIds = this.keepIds ? this.changedIds : [];
        this.changedIds = lastIds;
        // find changed files
        const changedIds = getAffectedModuleIds(compilation.modules);
        this.changedIds = this.changedIds.concat(changedIds);

        chunks
        // skip non entry files
          .filter((chunk) => (chunk.isInitial ? chunk.isInitial() : chunk.initial))
          .forEach((chunk) => {
            // and finally set changed files
            chunk.files.forEach((file) => {
              const original = compilation.assets[file];
              const changedFiles = `[${this.changedIds.join(', ')}]`;
              const replacement = `var __webpackManifest__ = ${changedFiles};`;

              // todo need a way to inject the changed module ids into the bundle instead of prepending
              // without breaking sourcemaps
              const result = new ConcatSource(replacement, '\n', original);
              compilation.assets[file] = result; // eslint-disable-line no-param-reassign
            });
          });
        callback();
      });
    });
  }

}
