import { rqSearch } from './request';

function pathForLogout() {
  return `http://${process.env.SEARCH}/bin/gate.exe`;
}

async function visitLogoutPage({jar, state}) {
  const logoutBody = await rqSearch({
    jar,
    uri: pathForLogout(),
    qs: {
      'state': state,
      'f': 'logout',
      'a_logout': 'Logout',
    },
  });
  return logoutBody;
}

export default function sessionDestroy(session, {silent}) {
  return new Promise(async function(resolve, reject) {
    const t0 = new Date();
    let sessionError = null;
    try {
      console.log('*** GETTING LOGOUT PAGE');
      const logoutBody = await visitLogoutPage(session);
      console.log('* GOT BODY', logoutBody, new Date() - t0);

    } catch(error) {
      sessionError = error;
    }

    if (sessionError === null || silent) {
      resolve();
    } else {
      reject(sessionError);
    }
  });
}
