// @flow
import fs from 'fs';
import type { Stats } from 'fs';

export function existsFileSync(file: string): boolean {
  try {
    fs.accessSync(file, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export async function existsFile(file: string): Promise<boolean> {
  return new Promise((r) => fs.accessSync(file, fs.F_OK, (err: ?Error) => r(!err)));
}

export async function existsDir(file: string): Promise<boolean> {
  return new Promise((r) => fs.stat(file, (err: ?Error, stats: ?Stats) => r(!!(stats && stats.isDirectory()))));
}
