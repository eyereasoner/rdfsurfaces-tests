#!/bin/bash

FILE=$1
R2FOL=${HOME}/github.com/RebekkaMa/rs2fol/bin/rs2fol
VAMPIRE=/usr/local/bin/vampire

if [ "${FILE}" == "" ]; then
   echo "usage: $0 file"
   exit 1
fi

${R2FOL} transform -i ${FILE}
