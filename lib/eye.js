const fs  = require('fs');
const exec = require('child_process').exec;

async function reason(filePath, config) {
    return new Promise( (resolve) => {
        if (config.type === 'skip') {
            resolve([null]);
            return;
        }

        try {
            const command = `${config.eye.path} ${config.eye.args} ${filePath} > ${filePath}.out 2>&1`;
            exec(command, { 
                timeout: config.eye.timeout * 1000 ,
                killSignal: 'SIGKILL',
                windowsHide: true
            } , (error) => {
                if (error && error.killed) {
                    resolve([false,'TIMEOUT']);
                    return;
                }

                const output = fs.readFileSync(`${filePath}.out`, { encoding: 'utf-8'});

                if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
                    resolve([true]);
                }
                else if (config.type == 'fail' && output.match(/inference_fuse/g)) {
                    resolve([true]);
                }
                else if (config.type == 'normal' && output.match(/inference_fuse/g)) {
                    resolve([false,'CONTRADICTION?']);
                }
                else {
                    resolve([false]);
                }
            });
        }
        catch (e) {
            console.error(e);
            resolve([false,'CRASHED']);
        }
    });
}

module.exports = { reason };