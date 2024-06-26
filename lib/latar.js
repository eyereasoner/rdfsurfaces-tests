const fs  = require('fs');
const exec = require('child_process').exec;

async function reason(filePath, config) {
    return new Promise( (resolve) => {
        if (config.type === 'skip' || ! filePath.match(/\/pure\//g)) {
            resolve(null);
        }

        try {
            const command = `timeout ${config.latar.timeout} ${config.latar.path} ${config.latar.args} ${filePath} > ${filePath}.out 2>&1`;
            exec(command, () => {
                const output = fs.readFileSync(`${filePath}.out`, { encoding: 'utf-8'});

                if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
                    resolve(true);
                }
                else if (config.type == 'fail' && output.match(/contradicton detected/g)) {
                    resolve(true);
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