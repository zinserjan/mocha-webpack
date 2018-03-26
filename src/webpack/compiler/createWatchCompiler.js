// @flow
import _ from 'lodash';
import Watching from 'webpack/lib/Watching';
import type { Compiler } from '../types';

export type WatchCompiler = {
  watch: () => void,
  pause: () => void,
  getWatchOptions: () => {
    aggregateTimeout: number,
    ignored?: RegExp | string,
    poll?: number | boolean,
  },
}

const noop = () => undefined;
export default function createWatchCompiler(compiler: Compiler, watchOptions: {}): WatchCompiler {
  // this ugly statement to create a watch compiler is unfortunately necessary,
  // as webpack clears the file timestamps with the official compiler.watch()
  const createWatcher = () => new Watching(compiler, watchOptions, noop);
  let watchCompiler = null;

  return {
    watch() {
      if (watchCompiler === null) {
        watchCompiler = createWatcher();
      } else {
        const times = compiler.watchFileSystem.watcher.getTimes();
        // check if we can store some collected file timestamps
        // the non-empty check is necessary as the times will be reseted after .close()
        // and we don't want to reset already existing timestamps
        if (Object.keys(times).length > 0) {
          const timesMap = new Map(Object.keys(times).map((key) => [key, times[key]]));
          // set already collected file timestamps to cache compiled files
          // webpack will do this only after a file change, but that will not happen when we add or delete files
          // and this means that we have to test the whole test suite again ...
          compiler.fileTimestamps = timesMap; // eslint-disable-line no-param-reassign
          compiler.contextTimestamps = timesMap; // eslint-disable-line no-param-reassign
        }

        watchCompiler.close(() => {
          watchCompiler = createWatcher();
        });
      }
    },
    pause() {
      if (watchCompiler !== null && watchCompiler.watcher) {
        watchCompiler.watcher.pause();
      }
    },
    getWatchOptions() {
      // 200 is the default value by webpack
      return _.get(watchCompiler, 'watchOptions', { aggregateTimeout: 200 });
    },
  };
}
