import Fs from 'fs';
import Url from 'url';
import Cheerio from 'cheerio';
import { RpSearch } from './util/request';
import { writeFilePathSync } from './util/file';
import { initPhaseState, savePhaseState } from './util/run_state';
import timeout from './util/timeout';
import { pathForIndexFile } from './util/path_helper';
import { tracked } from './util/compose';
import sessionCreate from './session_create';
import sessionDestroy from './session_destroy';

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
  return RpSearch({
    jar,
    uri: urlForIndex(),
    qs: {
      'f': 'toc',
      'state': modifiedSID,
    },
  });
}

/**
 *
 */

function initIndexState(searchCode, args) {
  const phaseState = initPhaseState(searchCode, 'index', args);
  // if (phaseState.completed) {
  //   throw new Error(`Index operation marked as completed for code: ${searchCode}`);
  // }
  return phaseState;
}

function setIndexState(searchCode, phaseState, hasNextPage) {
  if (!hasNextPage) {
    phaseState.pageCount = pageIndex;
    phaseState.completed = true;
  }
  savePhaseState(searchCode, 'index', phaseState);
}

/**
 *
 */

async function indexDownload(searchCode, args) {
  // const t0 = new Date(); // @stats
  let session = null;
  try {
    const phaseState = initIndexState(searchCode, args);
    if (phaseState.completed) {
      console.log(`[WARN] Index operation marked as completed for code: ${searchCode}`); // @log
      return ;
    }
    const { perPage } = phaseState;
    session = await sessionCreate(searchCode, perPage);
    const $initBody = Cheerio.load(session.initBody);
    const indexSID = extractSID($initBody);
    let hasNextPage = false;
    do {
      const { pageIndex } = phaseState;
      const indexBody = await visitIndexPage(session, indexSID, pageIndex, perPage);
      const $indexBody = Cheerio.load(indexBody);
      const indexPath = pathForIndexFile({ searchCode, pageIndex });
      hasNextPage = $indexBody('img[alt="next TOC list"]').parent().is('a[href]');
      Fs.writeFileSync(indexPath, indexBody);
      console.log('* SAVED PAGE', pageIndex, '; Continue:', hasNextPage); // @log
      phaseState.pageIndex += 1;
      setIndexState(searchCode, phaseState, hasNextPage);
      console.log('* SLEEPING...'); // @log
      await timeout(10000);
    } while (hasNextPage);

  } finally {
    if (session) {
      await sessionDestroy(session, {silent: true});
    }
    // console.log('======== TOTAL TIME', new Date() - t0); // @stats
  }
}

export default tracked(indexDownload, {
  name: `bulk index downloader for code %0`,
});
