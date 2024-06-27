const fs  = require('fs');
const exec = require('child_process').exec;

async function reason(filePath, config) {
    return new Promise( (resolve) => {
        if (config.type === 'skip' || ! filePath.match(/\/pure\//g)) {
            resolve([null]);
            return;
        }

        try {
            const command = `${config.latar.path} ${config.latar.args} ${filePath} > ${filePath}.out 2>&1`;
            exec(command, {
                timeout: config.latar.timeout * 1000, 
                killSignal: 'SIGKILL',
                windowsHide: true
            }, (error) => {
                if (error && error.killed) {
                    resolve([false,'TIMEOUT']);
                    return;
                }

                const output = fs.readFileSync(`${filePath}.out`, { encoding: 'utf-8'});

                if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
                    resolve([true]);
                }
                else if (config.type == 'fail' && output.match(/contradicton detected/g)) {
                    resolve([true]);
                }
                else if (config.type == 'normal' && output.match(/contradicton detected/g)) {
                    resolve([false,'CONTRADICTION?']);
                }
                else {
                    resolve([false]);
                }
            });
        }
        catch (e) {
            resolve([false,'CRASHED']);
        }
    });
}

module.exports = { reason };