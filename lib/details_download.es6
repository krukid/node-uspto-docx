import Fs from 'fs';
import Cheerio from 'cheerio';
import detailsScrape from './details_scrape';
import timeout from './timeout';
import { initPhaseState, savePhaseState } from './run_state';
import { writeFilePathSync } from './file';

/**
 *
 */

function initDetailsState(searchCode, args) {
  const phaseState = initPhaseState(searchCode, 'details', args);
  if (phaseState.completed) {
    throw new Error(`Details operation marked as completed for code: ${searchCode}`);
  }
  return phaseState;
}

function saveDetailsState(searchCode, phaseState, pageIndex, hasNextPage) {
  if (!hasNextPage) {
    phaseState.pageCount = pageIndex;
    phaseState.completed = true;
  }
  phaseState.pageIndex = pageIndex + 1;
  savePhaseState(searchCode, 'details', phaseState);
}

/**
 *
 */

async function detailsChunkDownload(searchCode, { pageIndex }) {
  const body = Fs.readFileSync(`${APP_ROOT}/output/${searchCode}/page${pageIndex}.html`);
  const $anchors = Cheerio.load(body)('a[href^="/bin/gate.exe?f=doc&state="]');
  for (let i = 0; i < $anchors.length; i += 4) {
    const serialNumber = $anchors.eq(i).text();
    const detailPath = `${APP_ROOT}/output/details/${serialNumber}.json`;
    if (!Fs.existsSync(detailPath)) {
      const details = await detailsScrape(serialNumber);
      writeFilePathSync(detailPath, JSON.stringify(details));
      console.log('* SAVED DETAILS FOR SN', serialNumber);
      await timeout(3000);
    }
  }
}

// TODO error handling
// TODO pathFor helpers
export default async function detailsDownload(searchCode, args) {
  const phaseState = initDetailsState(searchCode, args);
  const files = Fs.readdirSync(`${APP_ROOT}/output/${searchCode}`);
  const pageCount = files.length;
  do {
    const { pageIndex } = phaseState;
    await detailsChunkDownload(searchCode, { pageIndex });
    const hasNextPage = pageIndex + 1 < pageCount;
    saveDetailsState(searchCode, phaseState, pageIndex, hasNextPage);
    console.log('* EXTRACTED DETAILS FROM PAGE:', pageIndex);
    // await timeout(3000);
  } while (hasNextPage);
}
