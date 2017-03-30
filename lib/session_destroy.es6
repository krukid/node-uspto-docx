import { RpSearch } from './util/request';

/**
 *
 */

function urlForLogout() {
  return `http://${process.env.SEARCH}/bin/gate.exe`;
}

/**
 *
 */

async function visitLogoutPage({jar, state}) {
  return await RpSearch({
    jar,
    uri: urlForLogout(),
    qs: {
      'state': state,
      'f': 'logout',
      'a_logout': 'Logout',
    },
  });
}

/**
 *
 */

export default async function sessionDestroy(session, {silent}) {
  const t0 = new Date(); // @ stats
  try {
    console.log('*** GETTING LOGOUT PAGE'); // @log
    const logoutBody = await visitLogoutPage(session);
    console.log('* GOT LOGOUT BODY', new Date() - t0); // @log @stats

  } catch(error) {
    if (!silent) {
      throw error;
    }
  }
}
