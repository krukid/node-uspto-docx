import Fs from 'fs';
import Cheerio from 'cheerio';
import timeout from './util/timeout';
import { initPhaseState, savePhaseState } from './util/run_state';
import { pathForIndexDir, pathForIndexFile, pathsForDetails } from './util/path_helper';
import { tracked } from './util/compose';
import detailsDownload from './details_download';

/**
 *
 */

function initDetailsState(searchCode, args) {
  return initPhaseState(searchCode, 'details', args);
}

function saveDetailsState(searchCode, phaseState, pageIndex, hasNextPage) {
  if (!hasNextPage) {
    phaseState.pageCount = pageIndex;
    phaseState.completed = true;
  }
  savePhaseState(searchCode, 'details', phaseState);
}

/**
 * Downloads details for each item in `pageIndex` index file for given `searchCode`.
 * Skips if target details file already exists.
 */

async function detailsDownloadForPage(searchCode, { pageIndex }) {
  const pagePath = pathForIndexFile({ searchCode, pageIndex });
  const body = Fs.readFileSync(pagePath);
  const $anchors = Cheerio.load(body)('a[href^="/bin/gate.exe?f=doc&state="]');
  for (let i = 0; i < $anchors.length; i += 4) {
    const serialNumber = $anchors.eq(i).text();
    const paths = pathsForDetails({ searchCode, serialNumber });
    if (!Fs.existsSync(paths.rawDetailsPath)) {
      const isWithoutNetwork = await detailsDownload(serialNumber, paths);
      if (!isWithoutNetwork) {
        await timeout(3000);
      }
    }
  }
}

/**
 * Downloads details for each item in all index files for given `searchCode`.
 * Saves state after page completion.
 */

async function indexDetailsDownload(searchCode, args) {
  const phaseState = initDetailsState(searchCode, args);
  if (phaseState.completed) {
    console.log(`[WARN] Details operation marked as completed for code: ${searchCode}`); // @log
    return ;
  }
  const detailsDir = pathForIndexDir({ searchCode });
  const files = Fs.readdirSync(detailsDir);
  const pageCount = files.length;
  let hasNextPage = false;
  do {
    const { pageIndex } = phaseState;
    await detailsDownloadForPage(searchCode, { pageIndex });
    hasNextPage = pageIndex + 1 < pageCount;
    phaseState.pageIndex = pageIndex + 1;
    saveDetailsState(searchCode, phaseState, pageIndex, hasNextPage);
    console.log('* EXTRACTED DETAILS FROM PAGE:', pageIndex); // @log
  } while (hasNextPage);
}

export default tracked(indexDetailsDownload, {
  name: `bulk details downloader for code %0`,
});
