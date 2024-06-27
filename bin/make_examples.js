#!/usr/bin/env node


const { performance } = require('perf_hooks');
const path = require('path');
const fs = require('fs');
const { error } = require('console');

const RED = "\x1b[31m";
const PINK = "\x1b[35m";
const GREEN = "\x1b[32m";
const NORMAL = "\x1b[0;39m";

const arg0 = process.argv[2];

main(arg0);

async function main(arg0) {
    if (!arg0) {
        console.error(`${RED}usage: make_examples.js clean|reasoner_lib${NORMAL}`);
        process.exit(1);
    }
    else if (arg0 === 'clean') {
        clean_tests();
    }
    else {
        const reasoner = load_library(arg0);
        if (!reasoner) {
            console.error(`${RED}no such reasoner ${arg0}${NORMAL}`);
            process.exit(2);
        }

        const start   = performance.now();
        const result  = await run_tests(reasoner);
        const elapsed = (performance.now() - start) / 1000;
        console.log(`Required: ${elapsed} seconds`);

        if (fs.existsSync('.history')) {
            const history = JSON.parse(fs.readFileSync('.history', { encoding: 'utf-8' }));
            const prev_run = history[arg0];
            if (prev_run) {
               console.log(` That is ...`);
               for (let i = prev_run.length - 1 ; i >= 0 ; i--) {
                   const prev = prev_run[i];
                   const comp = elapsed - prev;
                   const perc = (elapsed / comp) * 100 ;
                   if (comp > 0) {
                      console.log(` ${comp} slower than run[${i}] = ${perc}%`);
                   }
                   else {
                      console.log(` ${comp} faster than run[${i}] = ${perc}%`);
                   }
               }
               history[arg0].push(elapsed);
            }
            else {
               history[arg0] = [elapsed];
            }
            history[arg0] = history[arg0].slice(Math.max(history[arg0].length - 5, 0));
            fs.writeFileSync('.history', JSON.stringify(history));
        }
        else {
            const history = {};
            history[arg0] = [elapsed];
            fs.writeFileSync('.history', JSON.stringify(history));
        }

        process.exit(result ? 0 : 2);
    }
}

function *walkSync(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true} );
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        }
        else {
            yield path.join(dir,file.name);
        }
    }
}

async function run_tests(reasoner) {
    let config = {};

    if (fs.existsSync('config.json')) {
        config = JSON.parse(fs.readFileSync('config.json', { encoding: 'utf-8'}));
    }
    else {
        console.error(`${RED}need a config.json${NORMAL}`);
        process.exit(1);
    }

    let ok = 0, failed = 0, skipped = 0;

    for (const filePath of walkSync('./test')) {
        if (! filePath.endsWith('.n3s')) {
            continue;
        }

        let type = undefined;

        if (filePath.match(/:SKIP/)) {
            type = `skip`;
        }
        else if (filePath.match(/:FAIL/)) {
            type = `fail`;
        }
        else {
            type = `normal`;
        }

        let result;

        try {
            config.type = type;
            result = await reasoner(filePath,config);
        }
        catch(e) {
            console.error(e);
            result = false;
        }

        if (result === null) {
            skipped++;
            console.log(`Testing ${filePath} ... ${PINK}SKIPPED${NORMAL}`);
        }
        else if (result) {
            ok++;
            console.log(`Testing ${filePath} ... ${GREEN}OK${NORMAL}`);
        }
        else {
            failed++;
            console.log(`Testing ${filePath} ... ${RED}FAILED${NORMAL}`);
        }
    } 

    console.log(`Results: ${GREEN}${ok} OK${NORMAL}, ${RED}${failed} FAILED${NORMAL}, ${PINK}${skipped} SKIPPED${NORMAL}`);

    return failed;
}

function clean_tests() {
    for (const filePath of walkSync('./test')) {
        if (filePath.endsWith('.out')) {
            fs.unlinkSync(filePath);
        }
    }
}

function load_library(lib) {
    try {
        const abs_handler = path.resolve(lib);
        const reasoner = require(abs_handler).reason;
        return reasoner;
    }
    catch (e) {
        return null;
    }
}
