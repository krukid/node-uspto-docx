import Fs from 'fs';
import Path from 'path';
import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module';
import sizeOf from 'image-size';

function loadDoc() {
  const imageModule = (function() {
    const opts = { centered: false };
    opts.getImage = function(tagValue, tagName) {
      return Fs.readFileSync(tagValue, 'binary');
    };
    opts.getSize = function(img, tagValue, tagName) {
      try {
        const { width, height, type } = sizeOf(Buffer.from(img, 'binary'));
        return [width, height];
      } catch (e) {
        console.log('ERROR: Could not determine image dimensions', e);
      }
    };
    return new ImageModule(opts);
  })();

  // Load the docx file as a binary
  const templatePath = Path.resolve(APP_ROOT, 'templates', 'simple.docx');
  const content = Fs.readFileSync(templatePath, 'binary');

  const zip = new JSZip(content);
  const doc = new Docxtemplater();
  doc.attachModule(imageModule);
  doc.loadZip(zip);

  return doc;
}

export default function documentGenerate(serialNumber) {
  const t0 = new Date();
  const detailsPath = `${APP_ROOT}/output/details/${serialNumber}.json`;
  const details = JSON.parse(Fs.readFileSync(detailsPath));
  const doc = loadDoc();

  // // set the templateVariables
  // doc.setData({
  //   a: 'John',
  //   b: 'Doe',
  //   c: '0652455478',
  //   d: 'New Website',
  //   e: '__E',
  //   f: '123512313412',
  //   g: '123,567.00 EUR',
  //   h: '[Hello there]',
  //   jpg: 'images/simple.jpg',
  //   // jpg: 'output/76704337-logo',
  //   png: 'images/simple.png'
  // });
  doc.setData(details);

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render();
  }
  catch (error) {
    const json = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({error: json}));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
  }

  const outputBuf = doc.getZip().generate({type: 'nodebuffer'});

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  const outputPath = Path.resolve(APP_ROOT, 'output', 'forms', `${serialNumber}.docx`);
  Fs.writeFileSync(outputPath, outputBuf);

  console.log('* GENERATED FORM', serialNumber, new Date() - t0);
}
