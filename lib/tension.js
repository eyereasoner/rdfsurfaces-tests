const runner = require('../lib/process').runner;
const { IS_OK , IS_INCOMPLETE , IS_TIMEOUT , IS_LIE , IS_SKIPPED , IS_CRASHED } = require('../lib/errors');

async function reason(filePath, config) {
    return new Promise( async (resolve) => {
        if (config.type === 'skip' || ! filePath.match(/[\\/]pure[\\/]/g)) {
            resolve(IS_SKIPPED);
            return;
        }

        try {
            const command = `${config.tension.path} ${config.tension.args} ${filePath}`;
            const output = await runner(command,{
                timeout: config.tension.timeout * 1000,
                windowsHide: true
            });

            if (output == null) {
                resolve(IS_TIMEOUT);
            } 
            else if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_OK);
            } 
            else if (config.type == 'normal' && output.match(/Found a contradiction at root level/g)) {
                resolve(IS_LIE);
            }
            else if (config.type == 'lie' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_LIE);
            }
            else if (config.type == 'lie' && output.match(/^\s*$/g)) {
                resolve(IS_OK);
            }
            else if (config.type == 'fail' && output.match(/Found a contradiction at root level/g)) {
                resolve(IS_OK);
            }
            else if (config.type == 'fail' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_LIE);
            }
            else if (output.match(/Please don't put lists in subject for now/g)) {
                resolve(IS_SKIPPED);
            }
            else {
                resolve(IS_INCOMPLETE);
            }
        }
        catch (e) {
            console.error(e);
            resolve(IS_CRASHED);
        }
    });
}

module.exports = { reason };