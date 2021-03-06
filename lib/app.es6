process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection', reason);
  process.exit(1);
});

import readConfigSync from './util/read_config_sync';
import forceOutputDirectoriesSync from './util/force_output_directories_sync';
import { promiseChain } from './util/promise';
import indexDownload from './index_download';
import indexDetailsDownload from './index_details_download';
import detailsGenerate from './details_generate';
import pdfGenerate from './pdf_generate';

// NOTE can launch express web server to render friendly `run.json` state
// NOTE alternatively use pm2 free tier
async function workflow() {
  const config = readConfigSync();
  await promiseChain(config.queries, async ({searchCode, ...options}) => {
    forceOutputDirectoriesSync(searchCode);
    await indexDownload(searchCode, {pageIndex: 1, perPage: 500});
    await indexDetailsDownload(searchCode, {pageIndex: 1});
  });
  // NOTE can run these asynchronously, just need to handle async errors
  return promiseChain(config.queries, async ({searchCode, ...options}) => {
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
