import Fs from 'fs';
import { rmrf } from './util/file';
import { pathsForDetails } from './util/path_helper';
import detailsDownload from './details_download';
import formGenerateSync from './form_generate_sync';
import forceOutputDirectoriesSync from './util/force_output_directories_sync';

async function singleForm()  {
  const searchCode = process.argv[2];
  const serialNumber = process.argv[3];
  forceOutputDirectoriesSync(searchCode);

  const paths = pathsForDetails({ searchCode, serialNumber });
  rmrf(paths.detailsPath, true);
  rmrf(paths.rawDetailsPath, true);
  rmrf(paths.logoPath, true);

  await detailsDownload(serialNumber, paths);
  const details = JSON.parse(Fs.readFileSync(paths.detailsPath, 'utf8'));
  rmrf(details.formPath, true);

  formGenerateSync(details, {
    "template": "A_tmpl.docx",
    "addYears": 5
  });
}

singleForm().then(function() {
  console.log('All operations completed.');
}).catch(function(error) {
  console.error(error);
});
