import rp from 'request-promise';
import rq from 'request';
import cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';

/**
 * FINDERS
 */

function $serialNumber($) {
  return $('#summary .table').eq(2).find('.value').eq(0);
}

function $filingDate($) {
  return $('#summary .table').eq(2).find('.value').eq(1);
}

function $regNumber($) {
  return $('#summary .table').eq(2).find('.value').eq(2);
}

function $regDate($) {
  return $('#summary .table').eq(2).find('.value').eq(3);
}

/**
 * PATHS
 */

function pathForDetails(serialNumber) {
  return `http://${process.env.DOMAIN}/statusview/sn${serialNumber}`;
}

function pathForLogo(serialNumber) {
  const cacheBuster = new Date().getTime();
  return `http://${process.env.DOMAIN}/img/${serialNumber}/large?${cacheBuster}`;
}

/**
  * FORMATTERS
  */

function _text($node) {
  return $node.text().trim();
}

function _date($node, format) {

}

/**
 *
 */

const promise = new Promise(async function(resolve, reject) {
  const timeStart = new Date();
  try {
    const serialNumber = '76704337';

    // DETAIL VIEW DOESN'T NEED SESSION
    const detailPromise = rp({
      uri: pathForDetails(serialNumber),
      simple: true,
    }).then(body => {
      const $ = cheerio.load(body);
      const [serialNumberToCheck, filingDate, regNumber, regDate] = [
        _text($serialNumber($)),
        _text($filingDate($)),
        _text($regNumber($)),
        _text($regDate($))
      ];

      console.log('* GOT DETAILS', {
        serialNumber,
        serialNumberToCheck,
        filingDate,
        regNumber,
        regDate,
      });
    });

    // DETAIL LOGO DOESN'T NEED SESSION
    const imagePromise = new Promise((resolve, reject) => {
      rq.get(pathForLogo(serialNumber))
        .on('error', reject)
        .on('end', resolve)
        .pipe(fs.createWriteStream(path.resolve(APP_ROOT, 'output', `${serialNumber}-logo`)));
    })

    await Promise.all([detailPromise, imagePromise]);

  } catch (error) {
    console.error('error', error);
  }
  console.log(`${new Date() - timeStart}ms`);
  resolve();
});

export default promise;
