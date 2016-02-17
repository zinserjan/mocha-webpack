import fs from 'fs';

export function existsFileSync(file) {
  try {
    fs.accessSync(file, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export function existsDirSync(file) {
  try {
    return fs.statSync(file).isDir();
  } catch (err) {
    return false;
  }
}
