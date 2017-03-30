import Fs from 'fs';
import Path from 'path';
import { pathForDetailsDir } from './util/path_helper';
import formGenerateSync from './form_generate_sync';

export default function detailsGenerateSync(searchCode, templateNames) {
  const detailsDir = pathForDetailsDir({ searchCode });
  const files = Fs.readdirSync(detailsDir);
  files.forEach(detailsPath => {
    const details = JSON.parse(Fs.readSync(detailsPath));
    if (!Fs.existsSync(details.formPath)) {
      formGenerateSync(details);
    }
  });
}
