import { spawn } from 'child_process';
import { promiseChain } from './util/promise';
import { pathForFormDir, pathForPDFDir } from './util/path_helper';

// in 8.0.0+ util.promisify(exec)
function promisifyExec(cmd, opts) {
    return new Promise(function(resolve, reject) {
        exec(cmd, opts, function(err, stdout, stderr) {
            if (err) {
                reject(err);
            } else {
                resolve({stdout, stderr});
            }
        })
    });
}

export default async function pdfGenerate(searchCode) {
    const formPairs = [[
        pathForFormDir({searchCode, isUSA: true}),
        pathForPDFDir({searchCode, isUSA: true})
    ], [
        pathForFormDir({searchCode, isUSA: false}),
        pathForPDFDir({searchCode, isUSA: false})
    ]];
    return promiseChain(formPairs, async ([formDir, pdfDir]) => {
        console.log(`* Generating PDFs: ${formDir}" to "${pdfDir}"`); // @log
        // // const cmd = `[ $(ls -1 | wc -l) -gt 0 ] \\
        // //     && lowriter --headless --convert-to pdf --outdir ${pdfDir} *.docx`;
        // const cmd = `${APP_ROOT}/scripts/mounted/pdfify.sh ${pdfDir}`;
        // const { stdout, stderr } = await promisifyExec(cmd, {
        //     cwd: formDir
        // });
        // console.log(stderr); // @log

        await new Promise((resolve, reject) => {
          const child = spawn(`${APP_ROOT}/scripts/mounted/pdfify.sh`, [pdfDir], {
            cwd: formDir
          });

          child.stdout.on('data', function (data) {
            console.log(data.toString().trim());
          });

          child.stderr.on('data', function (data) {
            console.log(data.toString().trim());
          });

          child.on('close', function (code) {
            console.log(`[INFO] child process exited with code: ${code}`);
            if (code === 0) {
              resolve();
            } else {
              reject();
            }
          });
        });

    });
}
