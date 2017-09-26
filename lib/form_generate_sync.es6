import Fs from 'fs';
import Path from 'path';
import Moment from 'moment';
import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module';
import sizeOf from 'image-size';
import xmlescape from 'xml-escape';
import { pathForTemplateFile, pathForFormFile } from './util/path_helper';

/**
 *
 */

const MAX_IMAGE_WIDTH = 320;
const MAX_IMAGE_HEIGHT = 150;

function getImage(tagValue, tagName) {
  return Fs.readFileSync(tagValue, 'binary');
}

// function fitBox(width, height, maxW, maxH) {
//     let limW, limH, f;
//     const fw = width / maxW;
//     const fh = height / maxH;
//     if (fh > fw) {
//       f = height / width;
//       limW = Math.min(maxW, width);
//       limH = limW * f;
//     } else {
//       f = width / height;
//       limH = Math.min(maxH, height);
//       limW = limH * f;
//     }
//   return [limW, limH];
// }

function fitBox(width, height, maxW, maxH) {
  let limW, limH;
  const fw = width / maxW;
  const fh = height / maxH;
  if (fh > fw) {
    limH = Math.min(height, maxH);
    limW = limH * width / height;
  } else {
    limW = Math.min(width, maxW);
    limH = limW * height / width;
  }
  return [limW, limH];
}

function getSize(img, tagValue, tagName) {
  try {
    const { width, height, type } = sizeOf(Buffer.from(img, 'binary'));
    return fitBox(width, height, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT);
  } catch (e) {
    console.log('ERROR: Could not determine image dimensions', e);
  }
}

/**
 *
 */

function loadDoc(templatePath) {
  const content = Fs.readFileSync(templatePath, 'binary');

  const zip = new JSZip(content);
  const doc = new Docxtemplater();
  const imageModule = new ImageModule({ centered: false, getImage, getSize });
  doc.attachModule(imageModule);
  doc.loadZip(zip);

  return doc;
}

/**
 *
 */

const DATE_FORMAT = 'MMM. DD, YYYY';

function addYearsString(dateStr, years) {
  if (!dateStr) return null;
  return Moment(dateStr, DATE_FORMAT)
    .add(years, 'y')
    .format(DATE_FORMAT);
}

function addLineBreaks(paragraph) {
  const padding = '                ';
  return `
    <w:p>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:color w:val="333333"/>
        </w:rPr>
        ${paragraph.map(l => `<w:t xml:space="preserve">${padding}${xmlescape(l)}</w:t>`).join('<w:br/>')}
      </w:r>
    </w:p>
  `;
  // then in your template, just put {@text} instead of the usual {text}
}

function prepareFormData(details, options) {
  if (!details.ownerAddress || !details.markType || !details.register || !details.intClasses || !details.regDate) {
    console.error('!!! [WARN] Irregular details', details);
    details.ownerAddress = details.ownerAddress || [];
    details.markType = details.markType || [];
    details.register = details.register || [];
    details.intClasses = details.intClasses || [];
  }
  return {
    ownerName: details.ownerName,
    ownerAddress: addLineBreaks(details.ownerAddress),
    tradeMark: details.tradeMark,
    regNumber: details.regNumber,
    classCount: details.intClasses.length,
    renewalDate: addYearsString(details.regDate, options.addYears),
    markType: details.markType.join(', '),
    register: details.register.includes('Principal') ? 'Principal' : '',
    filingDate: details.filingDate,
    intClasses: details.intClasses.join(', '),
    dateInLocation: details.regDate,
    regDate: details.regDate,
    serialNumber: details.serialNumber,
    logoPath: details.logoPath,
  };
}
 
/**
 * 
 */

export default function formGenerateSync(searchCode, details, options) {
  const t0 = new Date(); // @stats

  const { isUSA } = details;
  const { templateName } = options;
  const templatePath = pathForTemplateFile({templateName, isUSA});
  const doc = loadDoc(templatePath);
  const data = prepareFormData(details, options);
  doc.setData(data);

  try {
    doc.render();
  }
  catch (error) {
    const json = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({error: json})); // @debug
    throw error;
  }

  const outputBuf = doc.getZip().generate({type: 'nodebuffer', compression: 'DEFLATE'});
  Fs.writeFileSync(pathForFormFile({ searchCode, ...details }), outputBuf);

  console.log('* GENERATED FORM', details.serialNumber, new Date() - t0); // @log @stats
}
