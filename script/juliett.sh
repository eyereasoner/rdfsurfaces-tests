#!/bin/bash

FILE=$1

if [ "${FILE}" == "" ]; then
   echo "usage: $0 file"
   exit 1
fi

RES=$(juliett --check-consistency ${FILE} 2>/dev/null)

if [[ $RES =~ INCONSISTENT ]]; then
    exit "Refutation found"
fi

RES=$(juliett --entails ./script/juliett-goal.n3 ${FILE})

if [[ $RES == ENTAILED* ]]; then
    cat ./script/juliett-goal.n3
else
    echo ""
fi