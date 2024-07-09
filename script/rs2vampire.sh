#!/bin/bash

DO_VAMPIRE=0

while getopts ":x" opt; do
    case $opt in
        x)
            DO_VAMPIRE=1 
    esac
done

shift $((OPTIND-1))

FILE=$1
R2FOL=${HOME}/github.com/RebekkaMa/rs2fol/bin/rs2fol
VAMPIRE=/usr/local/bin/vampire

if [ "${FILE}" == "" ]; then
   echo "usage: $0 file"
   exit 1
fi

if [ "${DO_VAMPIRE}" == "1" ]; then
    ${R2FOL} transform -i ${FILE} | vampire
else
    ${R2FOL} transform -i ${FILE}
fi
