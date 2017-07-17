// @flow
import { join, posix, win32 } from 'path';

// eslint-disable-next-line import/prefer-default-export
export function ensureAbsolutePath(path: string, basePath: string) {
  return posix.isAbsolute(path) || win32.isAbsolute(path) ? path : join(basePath, path);
}

