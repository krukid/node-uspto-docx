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
    pathForFormDir({searchCode, isUSA: false, isColorDrawing: false}),
    pathForFormDir({searchCode, isUSA: false, isColorDrawing: true}),
    pathForFormDir({searchCode, isUSA: true, isColorDrawing: false}),
    pathForFormDir({searchCode, isUSA: true, isColorDrawing: true}),
    pathForPDFDir({searchCode, isUSA: false, isColorDrawing: false}),
    pathForPDFDir({searchCode, isUSA: false, isColorDrawing: true}),
    pathForPDFDir({searchCode, isUSA: true, isColorDrawing: false}),
    pathForPDFDir({searchCode, isUSA: true, isColorDrawing: true}),
  ].forEach(forceDirectorySync);
}
