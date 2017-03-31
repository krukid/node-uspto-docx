import Fs from 'fs';
import Path from 'path';
import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module';
import sizeOf from 'image-size';
import { pathForTemplateFile } from './util/path_helper';

/**
 * 
 */

function getImage(tagValue, tagName) {
  return Fs.readFileSync(tagValue, 'binary');
}

function getSize(img, tagValue, tagName) {
  try {
    const { width, height, type } = sizeOf(Buffer.from(img, 'binary'));
    return [width, height];
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

// XXX pass 1:1 to template? if no time-sensitive info...
function prepareFormData(details, templateNames) {
  return {
    ownerName: details.ownerName, // XXX can be multiline - don't wrap?
    ownerAddress: details.ownerAddress, // FIXME does not wrap :( 3 lines in template, if more then append to 3rd
    tradeMark: details.tradeMark,
    regNumber: details.regNumber,
    classCount: details.intClasses.length,
    renewalDate: details.regDate, // TODO add template.addYears
    markType: details.markType.join(', '), // XXX handle empty list
    register: details.register.join(', '), // XXX debug when multiple; XXX handle empty list
    filingDate: details.filingDate,
    intClasses: details.intClasses.join(', '), // XXX debug when multiple; XXX handle empty list
    dateInLocation: details.regDate, // XXX take from dateInLocation field instead? not as described...
    regDate: details.regDate,
    serialNumber: details.serialNumber,
    logoPath: details.logoPath, // XXX max width & preserve ratio? debug large images
  };
}

/**
 * 
 */

export default function formGenerateSync(details, templateNames) {
  const t0 = new Date(); // @stats

  const templateName = templateNames.default; // TODO default/us based on details.isUSA
  const templatePath = pathForTemplateFile({templateName});
  const doc = loadDoc(templatePath);
  const data = prepareFormData(details, templateNames);
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

  const outputBuf = doc.getZip().generate({type: 'nodebuffer'});
  Fs.writeFileSync(details.formPath, outputBuf);

  console.log('* GENERATED FORM', details.serialNumber, new Date() - t0); // @log @stats
}
