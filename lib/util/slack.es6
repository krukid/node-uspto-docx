import { rpBare } from './request';

const USERNAME = 'Dumbledor';

export async function slackSend(text) {
  // console.log(text);
  if (!process.env.SLACK) {
    return ;
  }
  try {
    await rpBare({
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
