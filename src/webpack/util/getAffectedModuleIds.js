// @flow
import type { Module, Chunk } from '../types';

type ModuleMap = { [key: string | number]: Module };
type ModuleUsageMap = {
  // child id
  [key: string | number]: ModuleMap,
};
const isBuilt = (module: Module): boolean => module.built;
const getId = (module: any): number | string => module.id;

const affectedModules = (map: ModuleMap, usageMap: ModuleUsageMap, affected: ModuleMap, moduleId: string | number) => {
  if (typeof affected[moduleId] !== 'undefined') {
    // module was already inspected, stop here otherwise we get into endless recursion
    return;
  }
  // module is identified as affected by this function call
  const module = map[moduleId];
  affected[module.id] = module; // eslint-disable-line no-param-reassign

  // next we need to mark all usages aka parents also as affected
  const usages = usageMap[module.id];
  if (typeof usages !== 'undefined') {
    const ids = Object.keys(usages);
    ids.forEach((id: string) => affectedModules(map, usageMap, affected, id));
  }
};

/**
 * Builds a map where all modules are indexed by it's id
 * {
 *   [moduleId]: Module
 * }
 */
const buildModuleMap = (modules: Array<Module>): ModuleMap => {
  const moduleMap = modules.reduce((memo, module: Module) => ({ ...memo, [module.id]: module }), {});
  return moduleMap;
};

/**
 * Builds a map with all modules that are used in other modules (child -> parent relation)
 *
 * {
 *  [childModuleId]: {
 *    [parentModuleId]: ParentModule
 *  }
 * }
 *
 * @param modules Array<number>
 * @return ModuleUsageMap
 */
const buildModuleUsageMap = (chunks: Array<Chunk>, modules: Array<Module>): ModuleUsageMap => {
  // build a map of all modules with their parent
  // {
  //    [childModuleId]: {
  //      [parentModuleId]: ParentModule
  //    }
  // }
  //
  const moduleUsageMap: ModuleUsageMap = modules.reduce((memo, module: Module) => {
    module.dependencies.forEach((dependency) => {
      const dependentModule = dependency.module;

      if (!dependentModule) {
        return;
      }
      if (typeof memo[dependentModule.id] === 'undefined') {
        memo[dependentModule.id] = {}; // eslint-disable-line no-param-reassign
      }
      memo[dependentModule.id][module.id] = module; // eslint-disable-line no-param-reassign
    });
    return memo;
  }, {});

  // build a map of all chunks with their modules
  // {
  //    [chunkId]: {
  //      [moduleId]: Module
  //    }
  // }
  const chunkModuleMap: ModuleUsageMap = chunks.reduce((memo, chunk: Chunk) => {
    // build chunk map first to get also empty chunks (without modules)
    memo[chunk.id] = {}; // eslint-disable-line no-param-reassign
    return memo;
  }, {});
  modules.reduce((memo, module: Module) => {
    module.getChunks().forEach((chunk: Chunk) => {
      memo[chunk.id][module.id] = module; // eslint-disable-line no-param-reassign
    });
    return memo;
  }, chunkModuleMap);

  // detect modules with code split points (e.g. require.ensure) and enhance moduleUsageMap with that information
  modules.forEach((module: Module) => {
    module.blocks
    // chunkGroup can be invalid in in some cases
      .filter((block) => block.chunkGroup != null)
      .forEach((block) => {
        // loop through all generated chunks by this module
        // $FlowFixMe - flow thinks that block.chunkGroup could be null
        block.chunkGroup.chunks.map(getId).forEach((chunkId) => {
          // and mark all modules of this chunk as a direct dependency of the original module
          Object
            .values((chunkModuleMap[chunkId]: ModuleMap))
            .forEach((childModule: any) => {
              if (typeof moduleUsageMap[childModule.id] === 'undefined') {
                moduleUsageMap[childModule.id] = {};
              }
              moduleUsageMap[childModule.id][module.id] = module;
            });
        });
      });
  });

  return moduleUsageMap;
};

/**
 * Builds a list with ids of all affected modules in the following way:
 *  - affected directly by a file change
 *  - affected indirectly by a change of it's dependencies and so on
 *
 * @param chunks Array<Chunk>
 * @param modules Array<Module>
 * @return {Array.<number>}
 */
export default function getAffectedModuleIds(chunks: Array<Chunk>, modules: Array<Module>): Array<number | string> {
  const moduleMap: ModuleMap = buildModuleMap(modules);
  const moduleUsageMap: ModuleUsageMap = buildModuleUsageMap(chunks, modules);

  const builtModules = modules.filter(isBuilt);
  const affectedMap: ModuleMap = {};
  builtModules.forEach((module: Module) => affectedModules(moduleMap, moduleUsageMap, affectedMap, module.id));

  return Object.values(affectedMap).map(getId);
}
