import url from 'url';
import cheerio from 'cheerio';
import { rqSearch, setCookie } from './request';

function pathForSession() {
  return `http://${process.env.SEARCH}/bin/gate.exe?f=login&p_lang=english&p_d=trmk`;
}

function pathForSearchForm(path) {
  return `http://${process.env.SEARCH}${path}`;
}

function pathForInitSearch() {
  return `http://${process.env.SEARCH}/bin/gate.exe`;
}

function $searchLink($) {
  return $('a[href^="/bin/gate.exe?f=search&state="]').eq(0);
}

function extractState(searchUrl) {
  return url.parse(searchUrl, true).query.state;
}

async function visitSessionPage(jar) {
  const sessionUrl = pathForSession();
  const sessionBody = await rqSearch({
    jar,
    uri: sessionUrl,
  });
  console.log(jar.getCookies(sessionUrl)); // debug
  return sessionBody;
}

async function visitFormPage(jar, formUrl) {
  const formBody = await rqSearch({
    jar,
    uri: formUrl,
  });
  console.log(formBody);
  console.log(jar.getCookies(formUrl)); // debug
  return formBody;
}

async function postInitPage(jar, state, searchCode, perPage) {
  const initUrl = pathForInitSearch();
  setCookie(jar, initUrl, {queryCookie: searchCode});
  const initBody = await rqSearch({
    jar,
    method: 'POST',
    uri: initUrl,
    form: {
      'f': 'toc',
      state,
      'p_search': 'search',
      'p_s_All': '',
      'BackReference': '',
      'p_L': perPage,
      'p_plural': 'yes',
      'p_s_ALL': searchCode,
      'a_search': 'Submit Query',
    },
    headers: {
      'Cache-Control': 'max-age=0'
    },
  });
  console.log(jar.getCookies(initUrl)); // debug
  return initBody;
}

export default function sessionCreate(searchCode, perPage) {
  return new Promise(async function(resolve, reject) {
    const t0 = new Date();
    let state = null;
    let jar = rqSearch.jar();
    try {
      console.log("*** CREATING SESSION");
      const sessionBody = await visitSessionPage(jar);
      const $session = cheerio.load(sessionBody);
      const formUrl = pathForSearchForm($searchLink($session).attr('href'));
      console.log('* GOT SEARCH URL', formUrl, new Date() - t0);
      state = extractState(formUrl);

      console.log('*** GETTING SEARCH FORM');
      const formBody = await visitFormPage(jar, formUrl);
      console.log('* GOT SEARCH FORM', new Date() - t0);

      console.log('*** POSTING SEARCH FORM');
      const initBody = await postInitPage(jar, state, searchCode, perPage);
      console.log('* POSTED SEARCH', new Date() - t0);
      console.log(initBody);

      resolve({state, jar, initBody});

    } catch(error) {
      reject(error);
    }
  });
}
