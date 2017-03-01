var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var ImageModule=require('docxtemplater-image-module');

var imageModule=(function() {
  var opts = {}
  opts.centered = false;
  opts.getImage=function(tagValue, tagName) {
      return fs.readFileSync(tagValue,'binary');
  }

  opts.getSize=function(img,tagValue, tagName) {
      return [150,150];
  }

  return new ImageModule(opts);
})();

var fs = require('fs');
var path = require('path');

//Load the docx file as a binary
var content = fs.readFileSync(path.resolve(__dirname, 'templates', 'simple.docx'), 'binary');

var zip = new JSZip(content);

var doc = new Docxtemplater();
doc.attachModule(imageModule);
doc.loadZip(zip);

//set the templateVariables
doc.setData({
    a: 'John',
    b: 'Doe',
    c: '0652455478',
    d: 'New Website',
    e: '__E',
    f: '123512313412',
    g: '123,567.00 EUR',
    h: '[Hello there]',
    jpg: 'images/simple.jpg',
    png: 'images/simple.png'
});

try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
}
catch (error) {
    var e = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: error.properties,
    }
    console.log(JSON.stringify({error: e}));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
}

var buf = doc.getZip().generate({type: 'nodebuffer'});

// buf is a nodejs buffer, you can either write it to a file or do anything else with it.
fs.writeFileSync(path.resolve(__dirname, 'output', 'output.docx'), buf);

console.log('Done.');
