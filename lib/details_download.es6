import Fs from 'fs';
import Rp from 'request-promise';
import { rqLogo } from './util/request';
import { urlForDetails, urlForLogo } from './util/url_helper';
import detailsScrapeSync from './details_scrape_sync';

/**
 *
 */

async function cachedDetailsDownload(setialNumber, {rawDetailsPath}) {
  let detailsBody;
  if (Fs.existsSync(rawDetailsPath)) {
    detailsBody = await Fs.readFile(rawDetailsPath);

  } else {
    detailsBody = await Rp({
      url: urlForDetails(serialNumber)
    });
    Fs.writeFileSync(rawDetailsPath, detailsBody);
  }
  return detailsBody;
}

async function logoDownload(serialNumber, logoPath) {
  const isDownloaded = await Fs.exists(logoPath);
  if (!isDownloaded) {
    await new Promise(function(resolve, reject) {
      rqLogo(urlForLogo(serialNumber))
        .on('error', reject)
        .on('end', resolve)
        .pipe(Fs.createWriteStream(logoPath));
    });
  }
}

/**
 * Downloads and scrapes details for given `serialNumber` with logo,
 * according to `paths`. Scrapes cached details HTML if available.
 */

export default async function detailsDownload(serialNumber, paths) {
  const t0 = new Date(); // @stats
  try {
    const detailsBody = await cachedDetailsDownload(serialNumber);

    const details = detailsScrapeSync(serialNumber, detailsBody, paths);
    Fs.writeFileSync(paths.detailsPath, JSON.stringify(details));

    if (details.logoPath) {
      await logoDownload(serialNumber, details.logoPath);
    }

    console.log('* SAVED DETAILS FOR SN', serialNumber); // @log

  } finally {
    console.log(new Date() - t0, 'ms'); // @stats
  }
}
