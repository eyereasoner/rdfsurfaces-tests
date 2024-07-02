const runner = require('../lib/process').runner;
const { IS_OK , IS_INCOMPLETE , IS_TIMEOUT , IS_LIE , IS_SKIPPED , IS_CRASHED } = require('../lib/errors');

async function reason(filePath, config) {
    return new Promise( async (resolve) => {
        if (config.type === 'skip' || ! filePath.match(/\/pure\//g)) {
            resolve(IS_SKIPPED);
            return;
        }

        try {
            const command = `${config.rs2fol.path} ${config.rs2fol.args} ${filePath}`;

            const output = await runner(command,{
                timeout: config.rs2fol.timeout * 1000,
                windowsHide: true
            });

            if (output == null) {
                resolve(IS_TIMEOUT);
            }
            else if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_OK);
            }
            else if (config.type == 'normal' && output.match(/Refutation found/g)) {
                resolve(IS_LIE);
            }
            else if (config.type == 'lie' && output.match(/.*:test.*is.*true/g)) {
                resolve(IS_LIE);
            }
            else if (config.type == 'lie' && output.match(/No answers found/g)) {
                resolve(IS_OK);
            }
            else if (config.type == 'fail' && output.match(/Refutation found/g)) {
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
            console.error(e);
            resolve(IS_CRASHED);
        }
    });
}

module.exports = { reason };