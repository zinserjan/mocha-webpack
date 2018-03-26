// @flow
import path from 'path';
import sortChunks from './sortChunks';
import getAffectedModuleIds from './getAffectedModuleIds';

import type { Chunk, Module, Stats } from '../types';

export type BuildStats = {
  affectedModules: Array<number | string>,
  affectedFiles: Array<string>,
  entries: Array<string>,
};


export default function getBuildStats(stats: Stats, outputPath: string): BuildStats {
  const { chunks, chunkGroups, modules } = stats.compilation;

  const sortedChunks = sortChunks(chunks, chunkGroups);
  const affectedModules = getAffectedModuleIds(chunks, modules);

  const entries = [];
  const js = [];
  const pathHelper = (f) => path.join(outputPath, f);


  sortedChunks.forEach((chunk: Chunk) => {
    const files = Array.isArray(chunk.files) ? chunk.files : [chunk.files];

    if (chunk.isOnlyInitial()) {
      // only entry files
      const entry = files[0];
      entries.push(entry);
    }

    if (chunk.getModules().some((module: Module) => affectedModules.indexOf(module.id) !== -1)
    ) {
      files.forEach((file) => {
        if (/\.js$/.test(file)) {
          js.push(file);
        }
      });
    }
  });

  const buildStats: BuildStats = {
    affectedModules,
    affectedFiles: js.map(pathHelper),
    entries: entries.map(pathHelper),
  };

  return buildStats;
}
