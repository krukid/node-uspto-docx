import Url from 'url';
import Cheerio from 'cheerio';
import sessionCreate from './session_create';
import sessionDestroy from './session_destroy';
import { RpSearch } from './request';
import { writeFilePathSync } from './file';
import { initPhaseState, savePhaseState } from './run_state';
import timeout from './timeout';


/**
 *
 */

function urlForIndex() {
  return `http://${process.env.SEARCH}/bin/gate.exe`;
}

/**
 *
 */

function extractSID($) {
  const href = $('a[href^="/bin/gate.exe?f=search&state="]').attr('href');
  return Url.parse(href, true).query.state;
}

/**
 *
 */

async function visitIndexPage({jar}, indexSID, pageNum, perPage) {
  const modifiedSID = indexSID.replace(/\d+$/, (pageNum - 1) * perPage + 1);
  const indexBody = RpSearch({
    jar,
    uri: urlForIndex(),
    qs: {
      'f': 'toc',
      'state': modifiedSID,
    },
  });
  return indexBody;
}

/**
 *
 */

function initIndexState(searchCode, args) {
  const phaseState = initPhaseState(searchCode, 'index', args);
  if (phaseState.completed) {
    throw new Error(`Index operation marked as completed for code: ${searchCode}`);
  }
  return phaseState;
}

function setIndexState(searchCode, phaseState, pageIndex, hasNextPage) {
  if (!hasNextPage) {
    phaseState.pageCount = pageIndex;
    phaseState.completed = true;
  }
  phaseState.pageIndex = pageIndex += 1;
  savePhaseState(searchCode, 'index', phaseState);
}

/**
 *
 */

export default async function sessionTest(searchCode, args) {
  // const t0 = new Date();
  const phaseState = initIndexState(searchCode, args);
  let session = null;
  try {
    const { perPage } = phaseState;
    session = await sessionCreate(searchCode, perPage);
    const $initBody = Cheerio.load(session.initBody);
    const indexSID = extractSID($initBody);
    let hasNextPage = false;
    do {
      const { pageIndex } = phaseState;
      const indexBody = await visitIndexPage(session, indexSID, pageIndex, perPage);
      const $indexBody = Cheerio.load(indexBody);
      hasNextPage = $indexBody('img[alt="next TOC list"]').parent().is('a[href]');
      writeFilePathSync(`${APP_ROOT}/output/${searchCode}/page${pageIndex}.html`, indexBody);
      console.log('* SAVED PAGE', pageIndex, '; Continue:', hasNextPage); // debug
      setIndexState(searchCode, phaseState, pageIndex, hasNextPage);
      console.log('* SLEEPING...');
      await timeout(10000);
    } while (hasNextPage);

  } finally {
    if (session) {
      await sessionDestroy(session, {silent: true});
    }
    // console.log('======== TOTAL TIME', new Date() - t0); // debug
  }
}
