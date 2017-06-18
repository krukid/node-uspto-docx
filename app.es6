global.APP_ROOT = __dirname;
// global.DEBUG = false;

import readConfigSync from './lib/util/read_config_sync';
import forceOutputDirectoriesSync from './lib/util/force_output_directories_sync';
import { promiseChain } from './lib/util/promise';
import indexDownload from './lib/index_download';
import indexDetailsDownload from './lib/index_details_download';
import detailsGenerate from './lib/details_generate';
import pdfGenerate from './lib/pdf_generate';

// NOTE can launch express web server to render friendly `run.json` state
async function workflow() {
  const config = readConfigSync();
  return promiseChain(config.queries, async ({searchCode, ...options}) => {
    forceOutputDirectoriesSync(searchCode);
    await indexDownload(searchCode, {pageIndex: 1, perPage: 500});
    await indexDetailsDownload(searchCode, {pageIndex: 1});
    // NOTE can run these asynchronously, just need to handle async errors
    await detailsGenerate(searchCode, options);
    await pdfGenerate(searchCode);
  });
}

workflow().then(function() {
  console.log('All operations completed.');
}).catch(function(error) {
  console.error(error);
  process.exit(1);
});
