const IS_OK = 1;
const IS_INCOMPLETE = 2;
const IS_TIMEOUT = 3;
const IS_LIE = 4;
const IS_SKIPPED = 99;
const IS_CRASHED = 999;

function testOutput(output,config,regex) {
    if (output == null) {
        return IS_TIMEOUT;
    }
    else if (config.type == 'normal' && output.match(regex.isTrue)) {
        return IS_OK;
    }
    else if (config.type == 'normal' && output.match(regex.isContradiction)) {
        return IS_LIE;
    }
    else if (config.type == 'lie' && output.match(regex.isTrue)) {
        return IS_LIE;
    }
    else if (config.type == 'lie' && output.match(regex.isContradiction)) {
        return IS_LIE;
    }
    else if (config.type == 'lie' && output.match(regex.isEmpty)) {
        return IS_OK;
    }
    else if (config.type == 'fail' && output.match(regex.isContradiction)) {
        return IS_OK;
    }
    else if (config.type == 'fail' && output.match(regex.isTrue)) {
        return IS_LIE;
    }
    else {
        return IS_INCOMPLETE;
    }
}

module.exports = { 
    IS_OK , 
    IS_INCOMPLETE , 
    IS_TIMEOUT , 
    IS_LIE , 
    IS_SKIPPED ,
    IS_CRASHED ,
    testOutput
};