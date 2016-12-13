/*  eslint-disable no-underscore-dangle */

// see https://github.com/nodejs/node/blob/master/lib/module.js
import Module from 'module';

// the module in which the require() call originated
let requireCaller;
// all custom registered resolvers
const pathResolvers = [];

// keep original Module._resolveFilename
const originalResolveFilename = Module._resolveFilename;
// override Module._resolveFilename
Module._resolveFilename = function _resolveFilename(...parameters) {
  const parent = parameters[1];
  // store require() caller (the module in which this require() call originated)
  requireCaller = parent;
  return originalResolveFilename.apply(this, parameters);
};

// keep original Module._findPath
const originalFindPath = Module._findPath;
// override Module._findPath
Module._findPath = function _findPath(...parameters) {
  const request = parameters[0];

  // first try to resolve path with original resolver
  const filename = originalFindPath.apply(this, parameters);
  if (filename !== false) {
    return filename;
  }

  // and when none found try to resolve the path with custom resolvers
  for (const resolve of pathResolvers) {
    const resolved = resolve(request, requireCaller);
    if (typeof resolved !== 'undefined') {
      return resolved;
    }
  }

  return false;
};


export default function registerRequireHook(dotExt: string, resolve: (path: string, parent: Module) => string): void {
  // cache source code after resolving to avoid another access to the fs
  const sourceCache = {};

  const resolvePath = (path, parent) => {
    // get CommonJS module source code for this require() call
    const source = resolve(path, parent);

    // if no CommonJS module source code returned - skip this require() hook
    if (source === null) {
      return void 0;
    }

    // flush require() cache
    delete require.cache[path];

    // put the CommonJS module source code into the hash
    sourceCache[path] = source;

    // return the path to be require()d in order to get the CommonJS module source code
    return path;
  };

  const resolveSource = (path) => {
    const source = sourceCache[path];
    delete sourceCache[path];
    return source;
  };

  pathResolvers.push(resolvePath);


  // keep original extension loader
  const originalLoader = Module._extensions[dotExt];
  // override extension loader
  Module._extensions[dotExt] = (module, filename) => {
    const source = resolveSource(filename, module);

    if (typeof source === 'undefined') {
      // load the file with the original loader
      (originalLoader || Module._extensions['.js'])(module, filename);
      return;
    }

    // compile javascript module from its source
    module._compile(source, filename);
  };
}
