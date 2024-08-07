const runner = require('../lib/process').runner;
const { IS_CRASHED , IS_SKIPPED , testOutput } = require('../lib/errors');

async function reason(filePath, config) {
    return new Promise( async (resolve) => {
        if (config.type === 'skip') {
            resolve(IS_SKIPPED);
            return;
        }

        try {
            const command = `${config.tension.path} ${config.tension.args} ${filePath}`;
            const output = await runner(command,{
                timeout: config.tension.timeout * 1000,
                windowsHide: true
            });

            const result = testOutput(output,config, {
                isTrue: new RegExp('Deduced .*:test.*is.*true','g') ,
                isContradiction: new RegExp('Found a contradiction at root level','g')
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
