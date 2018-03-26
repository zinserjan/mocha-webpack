// @flow
import fs from 'fs';

/* eslint-disable import/prefer-default-export */

export function existsFileSync(file: string): boolean {
  try {
    fs.accessSync(file, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
