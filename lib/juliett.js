const runner = require('../lib/process').runner;
const { default: test } = require('node:test');
const { IS_CRASHED , IS_SKIPPED , testOutput } = require('../lib/errors');

async function reason(filePath, config) {
    return new Promise( async (resolve) => {
        if (config.type === 'skip') {
            resolve(IS_SKIPPED);
            return;
        }

        try {
            const command = `${config.juliett.path} ${config.juliett.args} ${filePath}`;

            const output = await runner(command,{
                timeout: config.juliett.timeout * 1000,
                windowsHide: true
            });

            const result = testOutput(output,config, {
                isTrue: new RegExp('.*:test.*is.*true','g') ,
                isContradiction: new RegExp('Refutation found','g')
            });

            resolve(result);
        }
        catch (e) {
            console.error(e);
            resolve(IS_CRASHED);
        }
    });
}

module.exports = { reason };