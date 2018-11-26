import Fs from 'fs';
import { rmrf } from '../util/file';
import { pathsForDetails, pathForFormFile } from '../util/path_helper';
import detailsDownload from '../details_download';
import formGenerate from '../form_generate';
import pdfGenerate from '../pdf_generate';
import forceOutputDirectoriesSync from '../util/force_output_directories_sync';

async function singleForm()  {
  const searchCode = process.argv[2];
  const serialNumber = process.argv[3];
  forceOutputDirectoriesSync(searchCode);

  const paths = pathsForDetails({ searchCode, serialNumber });
  await rmrf(paths.detailsPath);
  await rmrf(paths.rawDetailsPath);
  await rmrf(paths.logoPath);

  await detailsDownload(serialNumber, paths);
  const details = JSON.parse(Fs.readFileSync(paths.detailsPath));
  await rmrf(pathForFormFile({ searchCode, ...details }));

  // details.isUSA = false;

  await formGenerate(searchCode, details, {
    "templateNames": {
      "usa": "F.docx",
      "intl": "N.docx",
    },
    "addYears": {
      "renewalDate": 5,
      "regDate": 0,
      "filingDate": 0,
      "dateInLocation": 0,
    },
  });

  pdfGenerate(searchCode);
}

singleForm().then(function() {
  console.log('All operations completed.');
}).catch(function(error) {
  console.error(error);
});
