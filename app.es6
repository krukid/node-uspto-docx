global.APP_ROOT = __dirname;
global.DEBUG = false;

import indexDownload from './lib/index_download';
import detailsDownload from './lib/details_download';
import detailsGenerate from './lib/details_generate';

// require('./lib/document.js');

async function workflow() {
  // await indexDownload('201204$[RD]', 1, 500);
  // await detailsDownload('201204$[RD]');
  detailsGenerate();
}

workflow().then(function() {
  console.log('All operations completed.');
});
