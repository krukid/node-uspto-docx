const paths = `
output/cache/201301$[RD]/details-json/85537181.json
output/cache/201301$[RD]/details-json/85501412.json
`.trim().split("\n");

// const paths = ['output/cache/201211$[RD]/details-json/78280192.json'];

import fs from 'fs';
import { pathForFormFile } from '../util/path_helper';

paths.forEach(path => {
    const json = JSON.parse(fs.readFileSync(path))
    json.intClasses = []
    // fs.writeFileSync(path, JSON.stringify(json))

    const searchCode = path.match(/\d\d\d\d\d[^/]+/)[0]
    const docPath = pathForFormFile({ searchCode, ...json });
    const pdfPath = docPath.replace('forms-docx', 'forms-pdf').replace('.docx', '.pdf')

    console.log(docPath, pdfPath)
    // fs.unlinkSync(docPath)
    // fs.unlinkSync(pdfPath)
})
