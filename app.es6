global.APP_ROOT = __dirname;
// global.DEBUG = false;

import readConfigSync from './lib/util/read_config_sync';
import forceOutputDirectoriesSync from './lib/util/force_output_directories_sync';
import { promiseChain } from './lib/util/promise';
import indexDownload from './lib/index_download';
import indexDetailsDownload from './lib/index_details_download';
import detailsGenerate from './lib/details_generate';

// TODO launch express web server to render friendly `run.json` state
async function workflow() {
  const config = readConfigSync();
  return promiseChain(config.queries, async ({searchCode, ...options}) => {
    forceOutputDirectoriesSync(searchCode);
    await indexDownload(searchCode, {pageIndex: 1, perPage: 500});
    await indexDetailsDownload(searchCode, {pageIndex: 1});
    await detailsGenerate(searchCode, options);
  });
}

workflow().then(function() {
  console.log('All operations completed.');
}).catch(function(error) {
  console.error(error);
});
