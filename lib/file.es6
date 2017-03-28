import Fs from 'fs';
import Path from 'path';

/**
 *
 */

export function writeFilePathSync(path, body) {
  const absDir = Path.resolve(Path.dirname(path));
  absDir.split(Path.sep).reduce(function(a, b) {
    const dir = `${a}${Path.sep}${b}`;
    if (!Fs.existsSync(dir)) {
      Fs.mkdirSync(dir);
    }
    return dir;
  });
  Fs.writeFileSync(path, body);
}
