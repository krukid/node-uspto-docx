import Fs from 'fs';
import Cheerio from 'cheerio';
import detailsScrape from './details_scrape';
import timeout from './timeout';

export default async function detailsDownload(searchCode) {
  // TODO getRunState => detailsPage, totalPages
  //   skip if detailsPage > totalPages
  const body = Fs.readFileSync(`${APP_ROOT}/output/${searchCode}/page28.html`);
  const $anchors = Cheerio.load(body)('a[href^="/bin/gate.exe?f=doc&state="]');
  let detailCounter = 0;
  for (let i = 0; i < $anchors.length; i += 4) {
    const serialNumber = $anchors.eq(i).text();
    // if fs.exists(output/details/serialNumber) fs.read() else scrape()
    const details = await detailsScrape(serialNumber);
    // TODO fs.write(output/details/serialNumber, details)
    detailCounter += 1;
    console.log(details); // debug
    // TODO setRunState => detailsPage + 1
    await timeout(10000);
  }
  console.log('printed', detailCounter); // debug
}
