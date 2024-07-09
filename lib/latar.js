const runner = require('../lib/process').runner;
const { IS_CRASHED , IS_SKIPPED , testOutput } = require('../lib/errors');

async function reason(filePath, config) {
    return new Promise( async (resolve) => {
        if (config.type === 'skip' || ! filePath.match(/\/pure\//g)) {
            resolve(IS_SKIPPED);
            return;
        }

        try {
            const command = `${config.latar.path} ${config.latar.args} ${filePath}`;

            const output = await runner(command,{
                timeout: config.latar.timeout * 1000,
                windowsHide: true
            });

            const result = testOutput(output,config, {
                isTrue: new RegExp('.*:test.*is.*true','g') ,
                isContradiction: new RegExp('contradiction detected','g')
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
