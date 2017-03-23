import Rp from 'request-promise';
import Rq from 'request';
import Cheerio from 'cheerio';
import Path from 'path';
import Fs from 'fs';

/**
 * FINDERS
 */

function $serialNumber($doc) {
  return $doc('#summary .table').eq(2).find('.value').eq(0);
}

function $filingDate($doc) {
  return $doc('#summary .table').eq(2).find('.value').eq(1);
}

function $regNumber($doc) {
  return $doc('#summary .table').eq(2).find('.value').eq(2);
}

function $regDate($doc) {
  return $doc('#summary .table').eq(2).find('.value').eq(3);
}

/**
 * URLs
 */

function urlForDetails(serialNumber) {
  return `http://${process.env.DOMAIN}/statusview/sn${serialNumber}`;
}

function urlForLogo(serialNumber) {
  const cacheBuster = new Date().getTime();
  return `http://${process.env.DOMAIN}/img/${serialNumber}/large?${cacheBuster}`;
}

/**
  * FORMATTERS
  */

function _text($node) {
  return $node.text().trim();
}

// function _date($node, format) {
//
// }

/**
 *
 */

export default async function scrapeDetails(serialNumber) {
  let scrapeResult = null;
  const t0 = new Date();
  try {
    const logoPath = Path.resolve(APP_ROOT, 'output', `${serialNumber}-logo`);

    const detailPromise = Rp({
      uri: urlForDetails(serialNumber),

    }).then(function(body) {
      const $body = Cheerio.load(body);
      const scrapedDetails = {
        serialNumber,
        logoPath,
        serialNumberToCheck: _text($serialNumber($body)),
        filingDate: _text($filingDate($body)),
        regNumber: _text($regNumber($body)),
        regDate: _text($regDate($body)),
      };
      console.log('* GOT DETAILS', scrapedDetails); // debug
      return scrapedDetails;
    });

    const imagePromise = new Promise(function(resolve, reject) {
      Rq.get(urlForLogo(serialNumber))
        .on('error', reject)
        .on('end', resolve)
        .pipe(Fs.createWriteStream(logoPath));
    });

    scrapeResult = Promise.all([
      detailPromise,
      imagePromise,
    ]).then(results => results[0]);

  } finally {
    console.log(new Date() - t0, 'ms');
  }
  return scrapeResult;
}
