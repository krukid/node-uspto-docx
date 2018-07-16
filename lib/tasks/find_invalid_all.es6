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
const INVALID_OWNER_NAMES = fs.readFileSync('./blacklist').toString().trim().split(/\r?\n/);

// const INVALID_OWNER_ADDRS = [
//   '6465 South Rainbow Boulevard',
//   '1800 Grant Street, Suite 745',
//   '1000 American Media Way',
// ];

function isOwnerNameInvalid(ownerName) {
  const lowerCaseName = ownerName ? ownerName.toLowerCase() : ''
  if (INVALID_OWNER_NAMES.find(x => lowerCaseName === x.toLowerCase())) {
    return true;
  } else {
    return false;
  }
}

findJSON(`${APP_ROOT}/output/cache`).then(paths => {
  console.log('Total details count', paths.length);
  
  //   let deleted = 0;
  let invalid = 0;
  let valid = 0;
  let errors = {
    register: 0,
    markType: 0,
    intClasses: 0,
    ownerAddress: 0,
    regDate: 0,
    ownerName: 0,
    ownerNameBlacklist: 0,
    filingDate: 0,
    serialNumber: 0,
    dateInLocation: 0,
    tradeMark: 0,
    regNumber: 0,
  }
  paths.forEach(path => {
    const json = JSON.parse(fs.readFileSync(path))
    let isInvalid = ''
    
    if (!isSetOf(json.register, VALID_RG)) {
      isInvalid = `${isInvalid}register;`
      errors.register += 1
    }
    if (!isSetOf(json.markType, VALID_TM)) {
      isInvalid = `${isInvalid}markType;`
      errors.markType += 1
    }
    if (json.intClasses.length === 0) {
      isInvalid = `${isInvalid}intClasses;`
      errors.intClasses += 1
    }
    if (json.ownerAddress.length === 0) {
      isInvalid = `${isInvalid}ownerAddress;`
      errors.ownerAddress += 1
    }
    if (json.regDate.length === 0) {
      isInvalid = `${isInvalid}regDate;`
      errors.regDate += 1
    }
    if (json.ownerName.length === 0) {
      isInvalid = `${isInvalid}ownerName;`
      errors.ownerName += 1
    } else if (isOwnerNameInvalid(json.ownerName)) {
      console.log(`[sn#${json.serialNumber}; rn#${json.regNumber}] ${json.ownerName}`);
      isInvalid = `${isInvalid}ownerNameBlacklist;`
      errors.ownerNameBlacklist += 1
    }
    if (json.filingDate.length === 0) {
      isInvalid = `${isInvalid}filingDate;`
      errors.filingDate += 1
    }
    if (json.serialNumber.length === 0) {
      isInvalid = `${isInvalid}serialNumber;`
      errors.serialNumber += 1
    }
    if (json.dateInLocation.length === 0) {
      isInvalid = `${isInvalid}dateInLocation;`
      errors.dateInLocation += 1
    }
    if (json.tradeMark.length === 0) {
      // isInvalid = `${isInvalid}tradeMark;`
      errors.tradeMark += 1
    }
    if (json.regNumber.length === 0) {
      isInvalid = `${isInvalid}regNumber;`
      errors.regNumber += 1
    }

    if (isInvalid.length > 0) {
    
      // const searchCode = path.match(/\d\d\d\d\d[^/]+/)[0]
      // const docPath = pathForFormFile({ searchCode, ...json });
      // const pdfPath = docPath.replace('forms-docx', 'forms-pdf').replace('.docx', '.pdf')
      
      // console.log("!!! invalid", json.serialNumber, isInvalid);
      // console.log('  docx', docPath.replace('/app/output', ''))
      // console.log('  pdf ', pdfPath.replace('/app/output', ''));
      invalid += 1;
      // deleted += 1;
      
      // console.log('!!! deleting', docPath, pdfPath);
      // fs.unlinkSync(docPath)
      // fs.unlinkSync(pdfPath)        
    }
  });
  console.log('****** invalid files found', invalid);
  console.log('****** valid files found', valid);
  console.log(errors)
}).catch(err => {
  console.log(err.message)
  console.log(err.stack)
});
