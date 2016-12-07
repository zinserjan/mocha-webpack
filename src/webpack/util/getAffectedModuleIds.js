// @flow
import type { Module } from '../types';

type Affected = { [key: string]: Module };
type Cache = { [key: string]: boolean };

function isBuilt(module: Module): boolean {
  return module.built;
}

function getId(module: Module): number {
  return module.id;
}


function dependentModules(module: Module, affected: Affected = {}, cache: Cache = {}): Affected {
  const id = getId(module);

  const idStr = id.toString();

  // check if module was already inspected
  if (cache[idStr]) {
    return affected;
  }
  // mark module as inspected
  cache[idStr] = true; // eslint-disable-line no-param-reassign

  // if (!module.dependencies) {
  //   return affected;
  // }

  module.dependencies.forEach((dependency) => {
    const dependentModule = dependency.module;

    if (!dependentModule) {
      return;
    }

    const dependentModuleId = getId(dependentModule);
    const dependentModuleIdStr = dependentModuleId.toString();

    if (isBuilt(dependentModule)) {
      // module was built, mark it as affected
      affected[dependentModuleIdStr] = dependentModule; // eslint-disable-line no-param-reassign
    }

    // check dependencies of module for changes
    dependentModules(dependentModule, affected, cache);

    if (affected[dependentModuleIdStr]) {
      // mark module as affected if one it's dependencies was detected as changed by recursive call
      affected[idStr] = module; // eslint-disable-line no-param-reassign
    }
  });
  return affected;
}

/**
 * Builds a list with ids of all affected modules in the following way:
 *  - affected directly by a file change
 *  - affected indirectly by a change of it's dependencies and so on
 *
 * @param modules
 * @return {Array.<number>}
 */
export default function getAffectedModuleIds(modules: Array<Module>): Array<number> {
  const builtModules: Array<Module> = modules.filter(isBuilt);

  const affected = builtModules.reduce((memo, module) => ({ ...memo, [module.id]: module }), {});
  const affectedModules = Array.prototype.concat.apply(
    builtModules,
    builtModules.map((module: Module) => Object.values(dependentModules(module, affected)))
  );
  const ids: Array<number> = affectedModules.map(getId);

  return ids;
}
