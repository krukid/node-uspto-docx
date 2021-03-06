import Fs from 'fs';
import Path from 'path';
import rimraf from 'rimraf';

/**
 *
 */

export function forceDirectorySync(dirPath) {
  const absDir = Path.resolve(dirPath);
  absDir.split(Path.sep).reduce(function(a, b) {
    const dir = `${a}${Path.sep}${b}`;
    if (!Fs.existsSync(dir)) {
      Fs.mkdirSync(dir);
    }
    return dir;
  });
}

export function writeFilePathSync(path, body) {
  forceDirectorySync(Path.dirname(path));
  Fs.writeFileSync(path, body);
}

export function rmrf(path) {
  return new Promise(function(resolve, reject) {
    rimraf(path, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// export function exists(path) {
//   return new Promise(function(resolve, reject) {
//     Fs.access(path, Fs.constants.R_OK, (err) => {
//       if (err) {
//         resolve(false);
//       } else {
//         resolve(true);
//       }
//     });
//   });
// }
