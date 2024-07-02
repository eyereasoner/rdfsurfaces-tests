const fs  = require('fs');
const spawn = require('child_process').spawn;
const { IS_OK , IS_INCOMPLETE , IS_TIMEOUT , IS_LIE , IS_SKIPPED , IS_CRASHED } = require('../lib/errors');

async function reason(filePath, config) {
    return new Promise( (resolve) => {
        if (config.type === 'skip' || ! filePath.match(/[\\/]pure[\\/]/g)) {
            resolve(IS_SKIPPED);
            return;
        }

        try {
            const proc = spawn(config.tension.path, [...config.tension.args.split(' '), filePath], {
                timeout: config.tension.timeout * 1000,
                windowsHide: true
            });
            let output = '';
            proc.stdout.on('data', (data) => {
              output += data;
            });
            proc.stderr.on('data', (data) => {
              output += data;
            });

            proc.on('exit', (code, signal) => {
                if (signal === 'SIGTERM') {
                  resolve(IS_TIMEOUT);
                } else if (config.type == 'normal' && output.match(/.*:test.*is.*true/g)) {
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
            });
        }
        catch (e) {
            resolve(IS_CRASHED);
        }
    });
}

module.exports = { reason };