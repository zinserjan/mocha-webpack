import toposort from 'toposort';

export default function sortChunks(chunks) {
  // build a map (chunk-id -> chunk) as look table.
  const nodeMap = chunks.reduce((map, chunk) => {
    map[chunk.id] = chunk; // eslint-disable-line no-param-reassign
    return map;
  }, {});

  // add edges for each parent relationship into the graph
  const edges = [];
  chunks.forEach((chunk) => {
    if (chunk.parents) {
      // Add an edge for each parent (parent -> child)
      chunk.parents.forEach((parentId) => {
        const parentChunk = nodeMap[parentId];
        // If the parent chunk does not exist (e.g. because of an excluded chunk) we ignore that parent
        if (parentChunk) {
          edges.push([parentChunk, chunk]);
        }
      });
    }
  });

  return toposort.array(chunks, edges);
}
