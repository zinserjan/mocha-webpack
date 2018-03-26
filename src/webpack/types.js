// @flow

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
  watchFileSystem: any,
  hooks: any,
  fileTimestamps: {},
  contextTimestamps: {},
  options: {
    output: {
      path: string,
    },
  },
}

/**
 * webpack/lib/Module.js
 */
export type Module = {
  id: number,
  rawRequest: string,
  built: boolean,
  dependencies: Array<{ module: Module }>,
  readableIdentifier: ?any,
  chunks: Array<Chunk>, // eslint-disable-line no-use-before-define
  getChunks: () => Array<Chunk>, // eslint-disable-line no-use-before-define
  blocks: Array<DependenciesBlock> // eslint-disable-line no-use-before-define
};

/**
 * Webpack build error or warning
 */
export type WebpackError = Error & {
  message: string,
  file?: ?string,
  module?: ?Module
};


/**
 * webpack/lib/Chunk.js
 */
export type Chunk = {
  id: number | string,
  modules: Array<Module>,
  chunks: Array<Chunk>,
  parents: Array<Chunk>,
  files: Array<string>,
  isOnlyInitial: () => boolean,
  getModules: () => Array<Module>,
};

/**
 * webpack/lib/ChunkGroup.js
 */
export type ChunkGroup = {
  chunks: Array<Chunk>,
};

/**
 * webpack/lib/DependenciesBlock.js
 * webpack/lib/AsyncDependenciesBlock.js
 */
export type DependenciesBlock = {
  chunkGroup?: ChunkGroup,
};

/**
 * webpack/lib/Compilation.js
 */
export type Compilation = {
  compiler: Compiler,
  plugin: (hook: string, fn: () => void) => void,
  modules: Module[],
  chunks: Chunk[],
  chunkGroups: ChunkGroup[],
  errors: Array<string | WebpackError>,
  warnings: Array<string | WebpackError>,
  assets: {
    [key: string]: {
      size: () => number,
      source: () => string,
      map: () => SourceMap,
    },
  }
};


/**
 * webpack/lib/Stats.js
 */
export type Stats = {
  compilation: Compilation,
  startTime: number,
  endTime: number,
  toString: (options: Object) => string,
  toJson: (options: ?Object) => {
    startTime: number,
    endTime: number,
    errors: Array<string | WebpackError>,
    warnings: Array<string | WebpackError>,
  },
  hasWarnings: () => boolean,
  hasErrors: () => boolean,
};
