import Fs from 'fs';
import { forceDirectorySync } from './file';
import {
  pathForIndexDir, pathForDetailsDir, pathForRawDetailsDir,
  pathForImageDir, pathForFormDir,
} from './path_helper';

export default function forceOutputDirectoriesSync(searchCode) {
  [
    pathForIndexDir({searchCode}),
    pathForRawDetailsDir({searchCode}),
    pathForDetailsDir({searchCode}),
    pathForImageDir({searchCode}),
    pathForFormDir({searchCode, isUSA: true}),
    pathForFormDir({searchCode, isUSA: false}),
  ].forEach(forceDirectorySync);
}