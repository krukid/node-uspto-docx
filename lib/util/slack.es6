import Rp from 'request-promise';

const USERNAME = 'Dumbledor';

export async function slackSend(text) {
  // console.log(text);
  if (!process.env.SLACK) {
    return ;
  }
  try {
    await Rp({
      uri: process.env.SLACK,
      method: 'POST',
      body: {
        text,
        username: USERNAME,
      },
      json: true,
    });
  } catch (error) {
    console.error(error);
  }
}
