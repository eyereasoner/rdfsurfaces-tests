const fs  = require('fs');
const runner = require('../lib/process').runner;
const { IS_CRASHED , IS_SKIPPED , testOutput } = require('../lib/errors');

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

            const result = testOutput(output,config, {
                isTrue: new RegExp('.*:test.*is.*true','g') ,
                isContradiction: new RegExp('inference_fuse','g'),
                isEmpty: new RegExp('^\s*$','g')
            });

            resolve(result);
        }
        catch (e) {
            resolve(IS_CRASHED);
        }
    });
}

module.exports = { reason };
