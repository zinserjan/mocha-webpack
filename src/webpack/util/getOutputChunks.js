import path from 'path';
import sortChunks from './sortChunks';

export type OutputChunks = {
  files: Array<string>,
  entries: Array<string>,
};

export default function getOutputChunks(statsJson, outputPath) {
  const { chunks = [] } = statsJson;

  const sortedChunks = sortChunks(chunks);

  const entries = [];
  const js = [];

  sortedChunks.forEach((chunk) => {
    const files = Array.isArray(chunk.files) ? chunk.files : [chunk.files];

    if ((chunk.isInitial ? chunk.isInitial() : chunk.initial)) {
      // only entry files
      const entry = files[0];
      entries.push(entry);
    }

    files.forEach((file) => {
      if (/\.js$/.test(file)) {
        js.push(file);
      }
    });
  });

  const outputChunks: OutputChunks = {
    files: js.map((f) => path.join(outputPath, f)),
    entries: entries.map((f) => path.join(outputPath, f)),
  };

  return outputChunks;
}
