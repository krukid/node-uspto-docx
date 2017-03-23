import Url from 'url';
import Cheerio from 'cheerio';
import { RpSearch, setCookie } from './request';

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
  const sessionBody = await RpSearch({
    jar,
    uri: sessionUrl,
  });
  // console.log(jar.getCookies(sessionUrl)); // debug
  return sessionBody;
}

async function visitFormPage(jar, formUrl) {
  const formBody = await RpSearch({
    jar,
    uri: formUrl,
  });
  // console.log(formBody);
  // console.log(jar.getCookies(formUrl)); // debug
  return formBody;
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
  // console.log(jar.getCookies(initUrl)); // debug
  return initBody;
}

/**
 *
 */

export default async function sessionCreate(searchCode, perPage) {
  const t0 = new Date();
  const jar = RpSearch.jar();

  console.log("*** CREATING SESSION");
  const sessionBody = await visitSessionPage(jar);
  const $session = Cheerio.load(sessionBody);
  const formUrl = urlForSearchForm($searchLink($session).attr('href'));
  console.log('* GOT SEARCH URL', formUrl, new Date() - t0);
  const state = extractState(formUrl);

  console.log('*** GETTING SEARCH FORM');
  const formBody = await visitFormPage(jar, formUrl);
  console.log('* GOT SEARCH FORM', new Date() - t0);

  console.log('*** POSTING SEARCH FORM');
  const initBody = await postInitPage(jar, state, searchCode, perPage);
  console.log('* POSTED SEARCH', new Date() - t0);
  // console.log(initBody); // debug

  return {state, jar, initBody};
}
