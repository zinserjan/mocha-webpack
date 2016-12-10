import sourceMapSupport from 'source-map-support';
import MemoryFileSystem from 'memory-fs';
import registerRequireHook from '../util/registerRequireHook';
import type { Compiler } from '../types';

export default function registerInMemoryCompiler(compiler: Compiler): void {
  const memoryFs = new MemoryFileSystem();
  compiler.outputFileSystem = memoryFs; // eslint-disable-line no-param-reassign

  const readFile = (filePath) => {
    try {
      const code = memoryFs.readFileSync(filePath, 'utf8');
      return code;
    } catch (e) {
      return null;
    }
  };

  // install require hook to be able to require webpack bundles from memory
  registerRequireHook('.js', readFile);

  // install source map support to read source map from memory
  sourceMapSupport.install({
    emptyCacheBetweenOperations: true,
    handleUncaughtExceptions: false,
    environment: 'node',
    retrieveFile: readFile,
  });
}
