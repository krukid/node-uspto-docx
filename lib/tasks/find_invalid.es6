import fs from 'fs';
import { pathForFormFile } from '../util/path_helper';
import { spawn, execSync } from 'child_process';

function findJSON(rootPath) {
  const out = execSync(`${APP_ROOT}/scripts/mounted/find_json.sh`, {
    cwd: rootPath
  }).toString().trim().split("\n");
  // console.log(out.find(x => !x.match(/details-json\/\d+\.json/)));
  return Promise.resolve(out);
}

function isSetOf(source, values) {
    return source.length > 0 && source.length === source.filter(x => values.includes(x)).length;
}

const VALID_TM = ['Trademark', 'Service Mark'];
const VALID_RG = ['Principal'];

findJSON(`${APP_ROOT}/output/cache`).then(paths => {
  console.log('Total details count', paths.length);

//   let deleted = 0;
  let invalid = 0;
  let valid = 0;
  paths.forEach(path => {
    const json = JSON.parse(fs.readFileSync(path))
    if (!isSetOf(json.register, VALID_RG)) { // skip already processed
        return;
    }
    if (isSetOf(json.markType, VALID_TM) && json.intClasses.length > 0) {
      valid += 1;
      return;
    }

    const searchCode = path.match(/\d\d\d\d\d[^/]+/)[0]
    const docPath = pathForFormFile({ searchCode, ...json });
    const pdfPath = docPath.replace('forms-docx', 'forms-pdf').replace('.docx', '.pdf')

    console.log("!!! invalid", json.serialNumber);
    console.log('  docx', docPath.replace('/app/output', ''))
    console.log('  pdf ', pdfPath.replace('/app/output', ''));
    invalid += 1;
    // deleted += 1;
    
    // console.log('!!! deleting', docPath, pdfPath);
    // fs.unlinkSync(docPath)
    // fs.unlinkSync(pdfPath)
  });
  console.log('****** total files to delete', invalid);
  console.log('****** valid files found', valid);
}).catch(err => {
  console.log(err.message)
  console.log(err.stack)
});
