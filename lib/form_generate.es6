import Fs from 'fs';
import { spawn } from 'child_process';
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

// @see http://officeopenxml.com/WPcontentOverview.php
function addLineBreaks(paragraph) {
  return `
    <w:p>
      <w:pPr>
        <w:ind w:left="892" />
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:color w:val="333333"/>
        </w:rPr>
        ${paragraph.map(l => `<w:t xml:space="preserve">${xmlescape(l)}</w:t>`).join('<w:br/>')}
      </w:r>
    </w:p>
  `;
  // then in your template, just put {@text} instead of the usual {text}
}

function isSetOf(source, values) {
  return source.length > 0 && source.length === source.filter(x => values.includes(x)).length;
}

const VALID_TM = ['Trademark', 'Service Mark'];
const VALID_RG = ['Principal'];

function validateDetails(details) {
  const errors = {}

  if (!isSetOf(details.register, VALID_RG)) {
    errors.register = `Bad register`
  }
  if (!isSetOf(details.markType, VALID_TM)) {
    errors.markType = `Bad markType`
  }
  if (details.intClasses.length === 0) {
    errors.intClasses = `Bad intClasses`
  }
  if (details.ownerAddress.length === 0) {
    errors.ownerAddress = `Empty address`
  }
  if (details.regDate.length === 0) {
    errors.regDate = `Empty regDate`
  }
  if (details.ownerName.length === 0) {
    errors.ownerName = `Empty ownerName`
  }
  if (details.filingDate.length === 0) {
    errors.filingDate = `Empty filingDate`
  }
  if (details.serialNumber.length === 0) {
    errors.serialNumber = `Empty serialNumber`
  }
  if (details.dateInLocation.length === 0) {
    errors.dateInLocation = `Empty dateInLocation`
  }
  // if (details.tradeMark.length === 0) {
  //   errors.tradeMark = `Empty tradeMark`
  // }
  if (details.regNumber.length === 0) {
    errors.regNumber = `Empty regNumber`
  }

  if (Object.keys(errors).length > 0) {
    return errors
  } else {
    return null
  }
}


function prepareFormData(details, options) {

  const errors = validateDetails(details)
  if (errors !== null) {
    console.log(`[INVALID] Skipping unexpected details`, errors)
    return null
  }

  return {
    ownerName: details.ownerName,
    ownerAddress: addLineBreaks(details.ownerAddress),
    tradeMark: details.tradeMark,
    regNumber: details.regNumber,
    classCount: details.intClasses.length,
    renewalDate: addYearsString(details.regDate, options.addYears),
    markType: details.markType.join(', '),
    register: details.register.join(', '),
    filingDate: details.filingDate,
    intClasses: details.intClasses.join(', '),
    dateInLocation: details.dateInLocation,
    regDate: details.regDate,
    serialNumber: details.serialNumber,
    logoPath: details.logoPath,
  };
}

function isBadLogo(path) {
  return new Promise((resolve, reject) => {
    const child = spawn('/usr/bin/identify', [path], {});

    // child.stdout.on('data', function (data) {
    //   console.log(data.toString().trim());
    // });

    // child.stderr.on('data', function (data) {
    //   console.log(data.toString().trim());
    // });

    child.on('close', function (code) {
      // console.log(`[INFO] child process exited with code: ${code}`);
      if (code === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
 
/**
 * 
 */

export default async function formGenerate(searchCode, details, options) {
  const t0 = new Date(); // @stats

  const isResetLogo = await isBadLogo(details.logoPath);
  if (isResetLogo) {
    console.log('[WARN] Logo is bad', details.logoPath);
    details.logoPath = null;
  }

  const { isUSA } = details;
  const { templateName } = options;
  const templatePath = pathForTemplateFile({templateName, isUSA});
  const doc = loadDoc(templatePath);
  const data = prepareFormData(details, options);
  if (data === null) {
    // console.log('* SKIPPED INVALID FORM', details.serialNumber, new Date() - t0); // @log @stats
    return
  }
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
    console.log(`Error geenerating template: ${templateName}`, details)
    console.log(JSON.stringify({error: json})); // @debug
    throw error;
  }

  const outputBuf = doc.getZip().generate({type: 'nodebuffer', compression: 'DEFLATE'});
  Fs.writeFileSync(pathForFormFile({ searchCode, ...details }), outputBuf);

  console.log('* GENERATED FORM', details.serialNumber, new Date() - t0); // @log @stats
}
