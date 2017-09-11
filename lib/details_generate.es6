import Fs from 'fs';
import { pathForDetailsDir, pathForFormFile } from './util/path_helper';
import { tracked } from './util/compose';
import formGenerateSync from './form_generate_sync';

async function detailsGenerate(searchCode, options) {
  const detailsDir = pathForDetailsDir({searchCode});
  const files = Fs.readdirSync(detailsDir);
  files.forEach(fileName => {
    const detailsPath = `${detailsDir}/${fileName}`;
    const details = JSON.parse(Fs.readFileSync(detailsPath));
    const formPath = pathForFormFile({ searchCode, ...details });
    if (!Fs.existsSync(formPath)) {
      formGenerateSync(searchCode, details, options);
    }
  });
}

export default tracked(detailsGenerate, {
  name: 'bulk form generator for code %0',
});
