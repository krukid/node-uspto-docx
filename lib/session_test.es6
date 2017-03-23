import fs from 'fs';
import url from 'url';
import cheerio from 'cheerio';
import sessionCreate from './session_create';
import sessionDestroy from './session_destroy';
import { rqSearch } from './request';

function extractState($) {
  const href = $('a[href^="/bin/gate.exe?f=search&state="]').attr('href');;
  return url.parse(href, true).query.state;
}

function pathForIndex() {
  return `http://${process.env.SEARCH}/bin/gate.exe`;
}

function visitIndexPage({jar}, extendedState, pageNum, perPage) {
  const modifiedState = extendedState.replace(/\d+$/, (pageNum - 1) * perPage + 1);
  return new Promise(async function(resolve, reject) {
    try {
      const indexBody = rqSearch({
        jar,
        uri: pathForIndex(),
        qs: {
          'f': 'toc',
          'state': modifiedState,
        },
      });
      resolve(indexBody);

    } catch(error) {
      reject(error);
    }
  });
}

export default function sessionTest(searchCode, startPage, perPage) {
  // TODO read /output/run.json => {code: {startPage: X, perPage}, ...}
  //   notify if found for searchCode, override params
  return new Promise(async function(resolve, reject) {
    const t0 = new Date();
    let session = null;
    let sessionError = null;
    try {
      session = await sessionCreate(searchCode, perPage);
      fs.writeFileSync(`${APP_ROOT}/output/pageInit.html`, session.initBody); // debug
      const $initBody = cheerio.load(session.initBody);
      const extendedState = extractState($initBody);

      const indexBody = await visitIndexPage(session, extendedState, startPage, perPage);
      const $indexBody = cheerio.load(indexBody);
      const hasNextPage = $indexBody('img[alt="next TOC list"]').parent().is('a[href]');
      fs.writeFileSync(`${APP_ROOT}/output/page${startPage}.html`, indexBody);
      console.log('* SUCCESS SAVING PAGE', startPage, 'Has more:', hasNextPage); // debug
      // TODO update run.json for searchCode

    } catch(error) {
      sessionError = error;
    }

    if (session) {
      await sessionDestroy(session, {silent: true});
    }
    console.log('======== TOTAL TIME', new Date() - t0); // debug

    if (sessionError) {
      reject(sessionError);
    } else {
      resolve();
    }
  });
}
