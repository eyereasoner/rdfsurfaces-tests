#!/bin/bash

FILE=$1
R2FOL=${HOME}/github.com/RebekkaMa/rs2fol/bin/rs2fol
VAMPIRE=/usr/local/bin/vampire

if [ "${FILE}" == "" ]; then
   echo "usage: $0 file"
   exit 1
fi

TMPFILE=$(mktemp)

cat ${FILE} > ${TMPFILE}

>> ${TMPFILE} cat <<EOF
() log:onQuerySurface {
   :test :is true .
} .
EOF

${R2FOL} transform-qa --vampire-exec ${VAMPIRE} -q -i ${TMPFILE}

rm ${TMPFILE}
