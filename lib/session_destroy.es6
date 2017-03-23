import { RpSearch } from './request';

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
  const logoutBody = await RpSearch({
    jar,
    uri: urlForLogout(),
    qs: {
      'state': state,
      'f': 'logout',
      'a_logout': 'Logout',
    },
  });
  return logoutBody;
}

/**
 *
 */

export default async function sessionDestroy(session, {silent}) {
  const t0 = new Date();
  try {
    console.log('*** GETTING LOGOUT PAGE');
    const logoutBody = await visitLogoutPage(session);
    console.log('* GOT LOGOUT BODY', new Date() - t0);
    // console.log(logoutBody); // debug

  } catch(error) {
    if (!silent) {
      throw error;
    }
  }
}
