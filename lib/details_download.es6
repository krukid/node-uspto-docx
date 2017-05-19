import Fs from 'fs';
import Rp from 'request-promise';
import { rmrf } from './util/file';
import { rqLogo } from './util/request';
import { urlForDetails, urlForLogo } from './util/url_helper';
import detailsScrapeSync from './details_scrape_sync';

/**
 *
 */

async function cachedDetailsDownload(serialNumber, rawDetailsPath, isCached) {
  let detailsBody;
  if (isCached) {
    detailsBody = Fs.readFileSync(rawDetailsPath);

  } else {
    detailsBody = await Rp({
      url: urlForDetails(serialNumber)
    });
    Fs.writeFileSync(rawDetailsPath, detailsBody);
  }
  return detailsBody;
}

async function cachedLogoDownload(serialNumber, logoPath, isCached) {
  if (!isCached) {
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
    let isWithoutNetwork = true;

    const isDetailsCached = await Fs.exists(paths.rawDetailsPath);
    const detailsBody = await cachedDetailsDownload(serialNumber, paths.rawDetailsPath, isDetailsCached);
    isWithoutNetwork = isWithoutNetwork && isDetailsCached;

    const details = detailsScrapeSync(serialNumber, detailsBody, paths);
    Fs.writeFileSync(paths.detailsPath, JSON.stringify(details));

    if (details.logoPath) {
      const isLogoCached = await Fs.exists(details.logoPath);
      await cachedLogoDownload(serialNumber, details.logoPath, isLogoCached);
      isWithoutNetwork = isWithoutNetwork && isLogoCached;
    }

    console.log('* SAVED DETAILS FOR SN', serialNumber); // @log
    return isWithoutNetwork;

  } catch (error) {
    rmrf(paths.detailsPath);
    rmrf(paths.rawDetailsPath);
    rmrf(paths.logoPath);
    throw error;

  } finally {
    console.log(new Date() - t0, 'ms'); // @stats
  }
}
