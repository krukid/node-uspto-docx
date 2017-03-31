import Fs from 'fs';
import { pathForDetailsDir } from './util/path_helper';
import formGenerateSync from './form_generate_sync';

export default function detailsGenerateSync(searchCode, templateNames) {
  const detailsDir = pathForDetailsDir({ searchCode });
  const files = Fs.readdirSync(detailsDir);
  files.forEach(fileName => {
    const detailsPath = `${detailsDir}/${fileName}`;
    const details = JSON.parse(Fs.readFileSync(detailsPath));
    if (!Fs.existsSync(details.formPath)) {
      formGenerateSync(details, templateNames);
    }
  });
}
