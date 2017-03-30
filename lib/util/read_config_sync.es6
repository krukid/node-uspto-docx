import Fs from 'fs';
import { pathForConfigFile } from './path_helper';

export default function readConfigSync() {
  return JSON.parse(Fs.readFileSync(pathForConfigFile()));
}
