const paths = `
output/cache/201211$[RD]/details-json/77925263.json
output/cache/201211$[RD]/details-json/85071769.json
output/cache/201211$[RD]/details-json/85096400.json
output/cache/201211$[RD]/details-json/85170263.json
output/cache/201211$[RD]/details-json/85179068.json
output/cache/201211$[RD]/details-json/85179815.json
output/cache/201211$[RD]/details-json/85184815.json
output/cache/201211$[RD]/details-json/85224520.json
output/cache/201211$[RD]/details-json/85266948.json
output/cache/201211$[RD]/details-json/85377452.json
output/cache/201211$[RD]/details-json/85406443.json
output/cache/201211$[RD]/details-json/85409688.json
output/cache/201211$[RD]/details-json/85449588.json
output/cache/201211$[RD]/details-json/85455159.json
output/cache/201211$[RD]/details-json/85539143.json
output/cache/201211$[RD]/details-json/85551059.json
output/cache/201211$[RD]/details-json/85557264.json
output/cache/201211$[RD]/details-json/85574675.json
output/cache/201211$[RD]/details-json/85581249.json
output/cache/201211$[RD]/details-json/85591918.json
output/cache/201211$[RD]/details-json/85613888.json
output/cache/201211$[RD]/details-json/85613933.json
output/cache/201211$[RD]/details-json/85664974.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77011530.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77063775.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77271347.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77275717.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77278574.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77282212.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77296167.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77335650.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77335656.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77336756.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77336811.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77357208.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77377701.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77383577.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77404228.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77414425.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77415769.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77429037.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/77433177.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/78519903.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/78819903.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/78819924.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/78901929.json
output/cache/200811$[RD] AND LIVE[LD]/details-json/78970157.json
output/cache/199811$[RD] AND LIVE[LD]/details-json/74531689.json
output/cache/199811$[RD] AND LIVE[LD]/details-json/74701120.json
output/cache/199811$[RD] AND LIVE[LD]/details-json/75089187.json
output/cache/199811$[RD] AND LIVE[LD]/details-json/75212929.json
output/cache/199811$[RD] AND LIVE[LD]/details-json/75287023.json
output/cache/199811$[RD] AND LIVE[LD]/details-json/75316651.json
`.trim().split("\n");

// const paths = ['output/cache/201211$[RD]/details-json/78280192.json'];

import fs from 'fs';
import { pathForFormFile } from './util/path_helper';

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
