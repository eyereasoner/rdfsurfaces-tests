#!/usr/bin/env node

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

        await run_tests(reasoner);
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

    if (failed) {
        process.exit(2);
    }
    else {
        process.exit(0);
    }
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