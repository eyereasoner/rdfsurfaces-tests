const fs  = require('fs');
const runner = require('../lib/process').runner;
const { IS_OK , IS_INCOMPLETE , IS_TIMEOUT , IS_LIE , IS_SKIPPED , IS_CRASHED } = require('../lib/errors');

async function reason(filePath, config) {
    return new Promise( async (resolve) => {
        if (config.type === 'skip') {
            resolve(IS_SKIPPED);
            return;
        }

        try {
            const command = `${config.retina.path} ${config.retina.args} ${filePath}`;

            const output = await runner(command,{
                timeout: config.retina.timeout * 1000,
                windowsHide: true
            });

            if (output == null) {
                resolve(IS_TIMEOUT);
            } 
            else if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_OK);
            }
            else if (config.type == 'normal' && output.match(/inference_fuse/g)) {
                resolve(IS_LIE);
            }
            else if (config.type == 'lie' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_LIE);
            }
            else if (config.type == 'lie' && output.match(/^\s*$/g)) {
                resolve(IS_OK);
            }
            else if (config.type == 'fail' && output.match(/inference_fuse/g)) {
                resolve(IS_OK);
            }
            else if (config.type == 'fail' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_LIE);
            }
            else {
                resolve(IS_INCOMPLETE);
            }
        }
        catch (e) {
            resolve(IS_CRASHED);
        }
    });
}

module.exports = { reason };
