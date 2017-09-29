import fs from 'fs';
import { pathForFormFile } from './util/path_helper';
import { spawn, execSync } from 'child_process';

function findJSON(rootPath) {
  const out = execSync(`${APP_ROOT}/scripts/mounted/find_json.sh`, {
    cwd: rootPath
  }).toString().trim().split("\n");
  // console.log(out.find(x => !x.match(/details-json\/\d+\.json/)));
  return Promise.resolve(out);
}


findJSON(`${APP_ROOT}/output/cache`).then(paths => {
  console.log('Total details count', paths.length);

  let deleted = 0;
  let valid = 0;
  paths.forEach(path => {
    const json = JSON.parse(fs.readFileSync(path))
    if (json.register.length === 1 && json.register[0] === 'Principal') {
      valid += 1;
      return;
    }

    const searchCode = path.match(/\d\d\d\d\d[^/]+/)[0]
    const docPath = pathForFormFile({ searchCode, ...json });
    const pdfPath = docPath.replace('forms-docx', 'forms-pdf').replace('.docx', '.pdf')

    deleted += 1;

    console.log('!!! deleting', docPath, pdfPath);
    fs.unlinkSync(docPath)
    fs.unlinkSync(pdfPath)
  });
  console.log('****** total files to delete', deleted);
  console.log('****** valid files found', valid);
}).catch(err => {
  console.log(err.message)
  console.log(err.stack)
});
