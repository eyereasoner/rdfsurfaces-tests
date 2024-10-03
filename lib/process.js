const fs = require('fs');
const spawn = require('child_process').spawn;

async function runner(command,options) {
    return new Promise( (resolve,reject) => {
        try {
            if (command.match(/\$HOME/g)) {
                command = command.replaceAll(/\$HOME/g,process.env.HOME);
            }

            const parts = command.split(/ +/g);
            const comm  = parts.shift();
            const filePath = parts[parts.length -1];

            const proc = spawn(comm, [...parts],options);

            let output = '';

            proc.stdout.on('data', (data) => {
              output += data;
            });
            proc.stderr.on('data', (data) => {
              output += data;
            });

            proc.on('exit', (code, signal) => {
                if (options.quiet) {
                    // don't print output;
                }
                else {
                    fs.writeFileSync(`${filePath}.out`,output, { encoding: 'utf-8'});
                }
                if (signal === 'SIGTERM') {
                    resolve(null);
                }
                else {
                    resolve(output);
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
}

module.exports = { runner };