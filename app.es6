global.APP_ROOT = __dirname;
// global.DEBUG = false;

import readConfigSync from './lib/util/read_config_sync';
import forceOutputDirectoriesSync from './lib/util/force_output_directories_sync';
import { promiseChain } from './lib/util/promise';
import indexDownload from './lib/index_download';
import indexDetailsDownload from './lib/index_details_download';
import detailsGenerateSync from './lib/details_generate_sync';

// import Fs from 'fs';
// import { pathsForDetails } from './lib/util/path_helper';
// import detailsScrapeSync from './lib/details_scrape_sync';
// async function workflow2() {
//   const params = { searchCode: '201204$[RD]', serialNumber: '85243001' };
//   const paths = pathsForDetails(params);
//   const detailsBody = Fs.readFileSync(paths.rawDetailsPath);
//   detailsScrapeSync(params.serialNumber, detailsBody, paths);
//   return Promise.resolve();
// }

// TODO easy API to refetch/regenerate page number N
// TODO easy API to refetch/regenerate detail, logo & form number with given SN
// TODO launch express web server to render friendly `run.json` state
async function workflow() {
  const config = readConfigSync();
  return promiseChain(config.queries, async ({searchCode, templateNames}) => {
    forceOutputDirectoriesSync(searchCode);
    await indexDownload(searchCode, {pageIndex: 1, perPage: 500});
    await indexDetailsDownload(searchCode, {pageIndex: 1});
    // detailsGenerateSync(searchCode, templateNames);
  });
}

workflow().then(function() {
  console.log('All operations completed.');
}).catch(function(error) {
  console.error(error);
});
