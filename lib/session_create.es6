import Url from 'url';
import Cheerio from 'cheerio';
import { RpSearch, setCookie } from './util/request';

/**
 *
 */

function urlForSession() {
  return `http://${process.env.SEARCH}/bin/gate.exe?f=login&p_lang=english&p_d=trmk`;
}

function urlForSearchForm(path) {
  return `http://${process.env.SEARCH}${path}`;
}

function urlForInitSearch() {
  return `http://${process.env.SEARCH}/bin/gate.exe`;
}

/**
 *
 */

function $searchLink($doc) {
  return $doc('a[href^="/bin/gate.exe?f=search&state="]').eq(0);
}

/**
 *
 */

function extractState(searchUrl) {
  return Url.parse(searchUrl, true).query.state;
}

/**
 *
 */

async function visitSessionPage(jar) {
  const sessionUrl = urlForSession();
  return await RpSearch({
    jar,
    uri: sessionUrl,
  });
}

async function visitFormPage(jar, formUrl) {
  return await RpSearch({
    jar,
    uri: formUrl,
  });
}

async function postInitPage(jar, state, searchCode, perPage) {
  const initUrl = urlForInitSearch();
  setCookie(jar, initUrl, {queryCookie: searchCode});
  const initBody = await RpSearch({
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
  return initBody;
}

/**
 *
 */

export default async function sessionCreate(searchCode, perPage) {
  const t0 = new Date(); // @stats
  const jar = RpSearch.jar();

  console.log("*** CREATING SESSION"); // @log
  const sessionBody = await visitSessionPage(jar);
  const $session = Cheerio.load(sessionBody);
  const formUrl = urlForSearchForm($searchLink($session).attr('href'));
  console.log('* GOT SEARCH URL', formUrl, new Date() - t0);  // @log @stats
  const state = extractState(formUrl);

  console.log('*** GETTING SEARCH FORM');  // @log
  const formBody = await visitFormPage(jar, formUrl);
  console.log('* GOT SEARCH FORM', new Date() - t0);  // @log @stats

  console.log('*** POSTING SEARCH FORM');  // @log
  const initBody = await postInitPage(jar, state, searchCode, perPage);
  console.log('* POSTED SEARCH', new Date() - t0);  // @log @stats

  return {state, jar, initBody};
}
