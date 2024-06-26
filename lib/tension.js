const fs  = require('fs');
const exec = require('child_process').exec;

async function reason(filePath, config) {
    return new Promise( (resolve) => {
        if (config.type === 'skip' || ! filePath.match(/\/pure\//g)) {
            resolve(null);
            return;
        }

        try {
            const command = `${config.tension.path} ${config.tension.args} ${filePath} > ${filePath}.out 2>&1`;
            exec(command, { 
                timeout: config.tension.timeout * 1000 ,
                killSignal: 'SIGKILL',
                windowsHide: true
            } , () => {
                const output = fs.readFileSync(`${filePath}.out`, { encoding: 'utf-8'});

                if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
                    resolve(true);
                }
                else if (config.type == 'fail' && output.match(/Found a contradiction at root level/g)) {
                    resolve(true);
                }
                else if (output.match(/Please don't put lists in subject for now/g)) {
                    resolve(null);
                }
                else {
                    resolve(false);
                }
            });
        }
        catch (e) {
            resolve(false);
        }
    });
}

module.exports = { reason };