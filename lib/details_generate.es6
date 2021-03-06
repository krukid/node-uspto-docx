import Fs from 'fs';
import { pathForDetailsDir, pathForFormFile } from './util/path_helper';
import { tracked } from './util/compose';
import formGenerate from './form_generate';
import { promiseChain } from './util/promise';

function shouldGenerateForm(details) {
  // only generate forms for "Principal" register
  return details.register.length === 1 && details.register[0] === 'Principal';
}

async function detailsGenerate(searchCode, options) {
  const detailsDir = pathForDetailsDir({searchCode});
  const files = Fs.readdirSync(detailsDir);
  // const tmp = {usa: 0, intl: 0}; //@tmp
  await promiseChain(files, async (fileName) => {
    const detailsPath = `${detailsDir}/${fileName}`;
    const details = JSON.parse(Fs.readFileSync(detailsPath));
    // if (details.isUSA) tmp.usa += 1; else tmp.intl += 1; //@tmp
    // if (details.isUSA && tmp.usa > 1 || !details.isUSA && tmp.intl > 1) return; //@tmp
    const formPath = pathForFormFile({ searchCode, ...details });
    if (!Fs.existsSync(formPath) && shouldGenerateForm(details)) {
      await formGenerate(searchCode, details, options);
    }
  });
}

export default tracked(detailsGenerate, {
  name: 'bulk form generator for code %0',
});
