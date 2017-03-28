import Fs from 'fs';
// import Path from 'path';

/**
 *
 */

function pathForRunState() {
  return `${APP_ROOT}/output/run.json`;
}

/**
 *
 */

let _runState = null;

function getRunState() {
  const file = pathForRunState();
  let runState = {};
  if (Fs.existsSync(file)) {
    runState = JSON.parse(Fs.readFileSync(file));
  }
  return runState;
}

function getRunStateLazy() {
  if (_runState === null) {
    _runState = getRunState();
  }
  return _runState;
}

/**
 *
 */

export function initPhaseState(searchCode, phaseName, args) {
  const runState = getRunStateLazy();
  if (!runState[searchCode]) {
    runState[searchCode] = {};
  }
  if (!runState[searchCode][phaseName]) {
    runState[searchCode][phaseName] = args;
  }
  return runState[searchCode][phaseName];
}

export function savePhaseState(searchCode, phaseName, phaseState) {
  const runState = getRunStateLazy();
  runState[searchCode][phaseName] = phaseState;
  const file = pathForRunState();
  Fs.writeFileSync(file, JSON.stringify(runState));
}
