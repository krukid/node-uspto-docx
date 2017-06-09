import Fs from 'fs';
import { forceDirectorySync } from './file';
import {
  pathForIndexDir, pathForDetailsDir, pathForRawDetailsDir,
  pathForImageDir, pathForFormDir, pathForPDFDir,
} from './path_helper';

export default function forceOutputDirectoriesSync(searchCode) {
  [
    pathForIndexDir({searchCode}),
    pathForRawDetailsDir({searchCode}),
    pathForDetailsDir({searchCode}),
    pathForImageDir({searchCode}),
    pathForFormDir({searchCode, isUSA: true}),
    pathForFormDir({searchCode, isUSA: false}),
    pathForPDFDir({searchCode, isUSA: true}),
    pathForPDFDir({searchCode, isUSA: false}),
  ].forEach(forceDirectorySync);
}
