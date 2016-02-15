import fs from 'fs';

export default function existsSync(file) {
  try {
    fs.accessSync(file, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
