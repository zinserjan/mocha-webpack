// @flow
import path from 'path';
import globby from 'globby';
import isGlob from 'is-glob';
import globParent from 'glob-parent';
import normalizePath from 'normalize-path';

const isDirectory = (filePath) => path.extname(filePath).length === 0;

export const glob = async (
  patterns: Array<string>,
  options: {},
): Promise<Array<string>> => globby(patterns, options);

export const ensureGlob = (entry: string, recursive: boolean = false, pattern: string = '*.js'): string => {
  const normalized = normalizePath(entry);

  if (isGlob(normalized)) {
    return normalized;
  } else if (isDirectory(normalized)) {
    if (!isGlob(pattern)) {
      throw new Error(`Provided Glob ${pattern} is not a valid glob pattern`);
    }

    const parent = globParent(pattern);
    if (parent !== '.' || pattern.indexOf('**') !== -1) {
      throw new Error(`Provided Glob ${pattern} must be a file pattern like *.js`);
    }

    const globstar = recursive ? '**/' : '';

    return `${normalized}/${globstar}${pattern}`;
  }
  return normalized;
};

export const extensionsToGlob = (extensions: Array<string>) => {
  const filtered = extensions.filter(Boolean);

  if (filtered.length === 0) {
    return '*.js';
  } else if (filtered.length === 1) {
    return `*${filtered[0]}`;
  }
  return `*{${filtered.join(',')}}`;
};
