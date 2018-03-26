import toposort from 'toposort';
// see https://github.com/jantimon/html-webpack-plugin/blob/8131d8bb1dc9b185b3c1709264a3baf32ef799bc/lib/chunksorter.js

export default function sortChunks(chunks, chunkGroups) {
  // We build a map (chunk-id -> chunk) for faster access during graph building.
  const nodeMap = {};

  chunks.forEach((chunk) => {
    nodeMap[chunk.id] = chunk;
  });

  // Add an edge for each parent (parent -> child)
  const edges = chunkGroups.reduce((result, chunkGroup) =>
    result.concat(Array.from(chunkGroup.parentsIterable, (parentGroup) => [parentGroup, chunkGroup])), []);
  const sortedGroups = toposort.array(chunkGroups, edges);
  // flatten chunkGroup into chunks
  const sortedChunks = sortedGroups
    .reduce((result, chunkGroup) => result.concat(chunkGroup.chunks), [])
    .map((chunk) => // use the chunk from the list passed in, since it may be a filtered list
      nodeMap[chunk.id])
    .filter((chunk, index, self) => {
      // make sure exists (ie excluded chunks not in nodeMap)
      const exists = !!chunk;
      // make sure we have a unique list
      const unique = self.indexOf(chunk) === index;
      return exists && unique;
    });
  return sortedChunks;
}
