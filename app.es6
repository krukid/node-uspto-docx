global.APP_ROOT = __dirname;
global.DEBUG = false;

import indexDownload from './lib/index_download';
import detailsDownload from './lib/details_download';
import detailsGenerate from './lib/details_generate';

// TODO easy API to refetch/regenerate page number N
// TODO easy API to refetch/regenerate detail, logo & form number with given SN
// TODO launch express web server to render friendly `run.json` state
async function workflow() {
  // await indexDownload('201204$[RD]', {pageIndex: 1, perPage: 500});
  await detailsDownload('201204$[RD]', {pageIndex: 1});
  // await detailsGenerate();
}

workflow().then(function() {
  console.log('All operations completed.');
}).catch(function(error) {
  console.error(error);
});
