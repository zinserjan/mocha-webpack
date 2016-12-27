
export type SourceMap = {
  sources: Array<any>,
  version: number,
  mappings: any,
  sourcesContent: any,
};

/**
 * webpack/lib/Compiler.js
 */
export type Compiler = {
  plugin: (hook: string, fn: () => void) => void,
  run: (cb: () => void) => void,
  watch: (watchOptions: {}, cb: () => void) => void,
  outputFileSystem: any,
}

/**
 * webpack/lib/Module.js
 */
export type Module = {
  id: number,
  rawRequest: string,
  built: boolean,
  dependencies: Array<{ module: Module }>,
};


/**
 * webpack/lib/Compilation.js
 */
export type Compilation = {
  compiler: Compiler,
  plugin: (hook: string, fn: () => void) => void,
  modules: Module[],
  assets: {
    [key: string]: {
      size: () => number,
      source: () => string,
      map: () => SourceMap,
    },
  }
}

/**
 * webpack/lib/Chunk.js
 */
export type Chunk = {
  id: number | string,
  modules: Array<Module>,
  chunks: Array<Chunk>,
  parents: Array<Chunk>,
  files: Array<string>,
};

/**
 * webpack/lib/Stats.js
 */
export type Stats = {
  compilation: Compilation,
  toString: (options: Object) => string,
  toJson: (options: Object) => Object,
  hasWarnings: () => boolean,
  hasErrors: () => boolean,
};
