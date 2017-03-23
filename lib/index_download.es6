import Url from 'url';
import Cheerio from 'cheerio';
import sessionCreate from './session_create';
import sessionDestroy from './session_destroy';
import { RpSearch } from './request';
import { initRunState, setRunState, writeFilePathSync } from './file';
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

function extractState($) {
  const href = $('a[href^="/bin/gate.exe?f=search&state="]').attr('href');
  return Url.parse(href, true).query.state;
}

/**
 *
 */

async function visitIndexPage({jar}, indexState, pageNum, perPage) {
  const modifiedState = indexState.replace(/\d+$/, (pageNum - 1) * perPage + 1);
  const indexBody = RpSearch({
    jar,
    uri: urlForIndex(),
    qs: {
      'f': 'toc',
      'state': modifiedState,
    },
  });
  return indexBody;
}

/**
 *
 */

export default async function sessionTest(searchCode, startPage, perPage) {
  const t0 = new Date();
  const runState = initRunState(searchCode, {startPage, perPage});
  let session = null;
  try {
    session = await sessionCreate(searchCode, perPage);
    // writeFilePathSync(`${APP_ROOT}/output/${searchCode}/0.html`, session.initBody); // debug
    const $initBody = Cheerio.load(session.initBody);
    const indexState = extractState($initBody);
    let pageSize = runState[searchCode].perPage;
    let pageIndex = runState[searchCode].startPage;
    let hasNextPage = false;
    do {
      const indexBody = await visitIndexPage(session, indexState, pageIndex, pageSize);
      const $indexBody = Cheerio.load(indexBody);
      hasNextPage = $indexBody('img[alt="next TOC list"]').parent().is('a[href]');
      writeFilePathSync(`${APP_ROOT}/output/${searchCode}/page${pageIndex}.html`, indexBody);
      console.log('* SAVED PAGE', pageIndex, '; Continue:', hasNextPage); // debug
      runState[searchCode].startPage = pageIndex += 1;
      setRunState(runState);
      console.log('* SLEEPING...');
      await timeout(10000);
    } while (hasNextPage);

  } finally {
    if (session) {
      await sessionDestroy(session, {silent: true});
    }
    console.log('======== TOTAL TIME', new Date() - t0); // debug
  }
}
