#!/usr/bin/env node


const { performance } = require('perf_hooks');
const path = require('path');
const fs = require('fs');
const { error } = require('console');
const { IS_OK , IS_INCOMPLETE , IS_TIMEOUT , IS_LIE , IS_SKIPPED , IS_CRASHED } = require('../lib/errors');

const RED = "\x1b[31m";
const PINK = "\x1b[35m";
const GREY = "\x1b[30m";
const GREEN = "\x1b[32m";
const NORMAL = "\x1b[0;39m";

const reasoner = process.argv[2];
const testFile = process.argv[3];

let config = {};

if (fs.existsSync('config.json')) {
    config = JSON.parse(fs.readFileSync('config.json', { encoding: 'utf-8'}));
}
else {
    console.error(`need a config.json`);
    process.exit(1);
}

if (! reasoner) {
    console.error(`usage: make_examples.js clean|reasoner_lib [file]`);
    process.exit(1);
}
else if (reasoner === 'clean') {
    clean_tests();
    process.exit(0);
}
else {
    main(reasoner,testFile);
}

async function main(lib, testFile) {
    const reasoner = load_library(lib);

    if (!reasoner) {
        console.error(`${RED}no such reasoner ${lib}${NORMAL}`);
        process.exit(2);
    }

    const start   = performance.now();
    const result  = await run_tests(reasoner,testFile);
    const elapsed = (performance.now() - start) / 1000;

    console.log(`Elapsed: ${elapsed} seconds`);

    if (config.history && ! testFile) {
        doHistory(lib,elapsed);
    }

    process.exit(result ? 0 : 2);
}

function doHistory(path,elapsed) {
    const historyPath = config.history.path;
    const historySize = config.history.size;

    if (fs.existsSync(historyPath)) {
        const history = JSON.parse(fs.readFileSync('.history', { encoding: 'utf-8' }));
        const prev_run = history[path];
        if (prev_run) {
           for (let i = prev_run.length - 1 ; i >= 0 ; i--) {
               const prev = prev_run[i];
               const comp = elapsed - prev;
               const perc = ((elapsed / prev) * 100 - 100);
               if (comp > 0) {
                  console.log(` ${comp} seconds slower than run[${i}] = ${RED}${perc}%${NORMAL}`);
               }
               else {
                  console.log(` ${comp} seconds faster than run[${i}] = ${GREEN}${perc}%${NORMAL}`);
               }
           }
           history[path].push(elapsed);
        }
        else {
           history[path] = [elapsed];
        }
        history[path] = history[path].slice(Math.max(history[path].length - historySize, 0));
        fs.writeFileSync(historyPath, JSON.stringify(history));
    }
    else {
        const history = {};
        history[path] = [elapsed];
        fs.writeFileSync(historyPath, JSON.stringify(history));
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

async function run_tests(reasoner, testFile) {
    let ok = 0, incomplete= 0, timeout = 0, lie = 0, skipped = 0, other = 0; 

    if (testFile) {
        const [ res_ok, res_incomplete , res_timeout , res_lie , res_skipped , res_other ] = await run_tests_one(reasoner,testFile);
        ok = ok + res_ok;
        incomplete = incomplete + res_incomplete;
        timeout = timeout + res_timeout;
        lie = lie + res_lie;
        skipped = skipped + res_skipped;
        other = other + res_other;
    }
    else {
        const testDir = config['test_dir'] || './test';
        const testExt = config['test_ext'] || './n3s';

        for (const filePath of walkSync(testDir)) {
            if (! filePath.endsWith(testExt)) {
                continue;
            }

            const [ res_ok, res_incomplete , res_timeout , res_lie , res_skipped , res_other ] = await run_tests_one(reasoner,filePath);

            ok = ok + res_ok;
            incomplete = incomplete + res_incomplete;
            timeout = timeout + res_timeout;
            lie = lie + res_lie;
            skipped = skipped + res_skipped;
            other = other + res_other;
        } 
    }

    console.log(`Results: ${GREEN}${ok} OK${NORMAL}, ${RED}${incomplete} INCOMPLETE${NORMAL}, ${RED}${lie} LIES${NORMAL}, ${PINK}${timeout} TIMEOUT${NORMAL}, ${GREY}${skipped} SKIPPED${NORMAL}, ${other} OTHER`);

    if (incomplete || lie || timeout || other) {
        return false;
    }
    else {
        return true;
    }
}

async function run_tests_one(reasoner,filePath) {
    let ok = 0, incomplete= 0, timeout = 0, lie = 0, skipped = 0 , other = 0; 
    let type = undefined;

    if (filePath.match(/:SKIP/)) {
        type = `skip`;
    }
    else if (filePath.match(/:FAIL/)) {
        type = `fail`;
    }
    else if (filePath.match(/:LIE/)) {
        type = `lie`;
    }
    else {
        type = `normal`;
    }

    let result;
    let answer;

    try {
        config.type = type;
        answer = await reasoner(filePath,config);
    }
    catch(e) {
        console.error(e);
        result = false;
    }

    if (answer == IS_SKIPPED) {
        skipped++;
        console.log(`Testing ${filePath} ... ${GREY}SKIPPED${NORMAL}`);
    }
    else if (answer === IS_OK) {
        ok++;
        console.log(`Testing ${filePath} ... ${GREEN}OK${NORMAL}`);
    }
    else if (answer === IS_TIMEOUT) {
        timeout++;
        console.log(`Testing ${filePath} ... ${PINK}TIMEOUT${NORMAL}`);
    }
    else if (answer === IS_INCOMPLETE) {
        incomplete++;
        console.log(`Testing ${filePath} ... ${RED}INCOMPLETE${NORMAL}`);
    }
    else if (answer === IS_LIE) {
        lie++;
        console.log(`Testing ${filePath} ... ${RED}LIE${NORMAL}`);
    }
    else {
        other++;
        console.log(`Testing ${filePath} ... OTHER`);
    }

    return [ ok , incomplete , timeout , lie , skipped , other ];
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
