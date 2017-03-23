import Fs from 'fs';
import Path from 'path';

/**
 *
 */

function pathForRunState() {
  return `${APP_ROOT}/output/run.json`;
}

/**
 *
 */

export function getRunState() {
  const file = pathForRunState();
  let runState = {};
  if (Fs.existsSync(file)) {
    runState = JSON.parse(Fs.readFileSync(file));
  }
  return runState;
}

export function setRunState(runState) {
  const file = pathForRunState();
  Fs.writeFileSync(file, JSON.stringify(runState));
}

export function initRunState(searchCode, params) {
  const runState = getRunState();
  if (!runState[searchCode]) {
    runState[searchCode] = params;
  }
  return runState;
}

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
