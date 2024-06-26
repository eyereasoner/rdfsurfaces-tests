#!/bin/bash

ARG0=$1

if [ "${ARG0}" == "" ]; then
    ./bin/make_examples.js lib/eye.js
elif [ "${ARG0}" == "clean" ]; then
    ./bin/make_examples.js clean
else
    echo "usage: $0 [clean]"
    exit 1
fi

exit 0