// @flow
import path from 'path';
import sourceMapSupport from 'source-map-support';
import MemoryFileSystem from 'memory-fs';
import registerRequireHook from '../../util/registerRequireHook';
import type { Compiler } from '../types';

const noop = () => null;

export default function registerInMemoryCompiler(compiler: Compiler) {
  const memoryFs = new MemoryFileSystem();
  compiler.outputFileSystem = memoryFs; // eslint-disable-line no-param-reassign

  let readFile = (filePath) => {
    try {
      const code = memoryFs.readFileSync(filePath, 'utf8');
      return code;
    } catch (e) {
      return null;
    }
  };

  const resolveFile = (filePath, requireCaller) => {
    // try to read file from memory-fs as it is
    let code = readFile(filePath);
    let resolvedPath = filePath;

    if (code === null && requireCaller != null) {
      const { filename } = requireCaller;
      if (filename != null) {
        // if that didn't work, resolve the file relative to it's parent
        resolvedPath = path.resolve(path.dirname(filename), filePath);
        code = readFile(resolvedPath);
      }
    }
    return { path: code !== null ? resolvedPath : null, source: code };
  };

  // install require hook to be able to require webpack bundles from memory
  const unmountHook = registerRequireHook('.js', resolveFile);

  // install source map support to read source map from memory
  sourceMapSupport.install({
    emptyCacheBetweenOperations: true,
    handleUncaughtExceptions: false,
    environment: 'node',
    retrieveFile: (f) => readFile(f), // wrapper function to fake an unmount function
  });

  return function unmount() {
    unmountHook();
    readFile = noop;
  };
}
