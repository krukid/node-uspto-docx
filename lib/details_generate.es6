import Fs from 'fs';
import { pathForDetailsDir, pathForFormFile } from './util/path_helper';
import { tracked } from './util/compose';
import formGenerateSync from './form_generate_sync';

function shouldGenerateForm(details) {
  // only generate forms for "Principal" register
  return details.register.length === 1 && details.register[0] === 'Principal';
}

async function detailsGenerate(searchCode, options) {
  const detailsDir = pathForDetailsDir({searchCode});
  const files = Fs.readdirSync(detailsDir);
  files.forEach(fileName => {
    const detailsPath = `${detailsDir}/${fileName}`;
    const details = JSON.parse(Fs.readFileSync(detailsPath));
    const formPath = pathForFormFile({ searchCode, ...details });
    if (!Fs.existsSync(formPath) && shouldGenerateForm(details)) {
      formGenerateSync(searchCode, details, options);
    }
  });
}

export default tracked(detailsGenerate, {
  name: 'bulk form generator for code %0',
});
