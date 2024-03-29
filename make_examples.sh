#!/bin/bash

RED="\033[31m"
PINK="\033[35m"
GREEN="\033[32m"
NORMAL="\033[0;39m"

OK=0
FAILED=0
SKIPPED=0

if [ "$1" == "clean" ]; then
    rm test/*.out 2> /dev/null
    exit 0
fi 

for n3s in test/*.n3s ; do 
    if [[ "$n3s" =~ SKIP ]] ; then
        echo "(skipping $n3s)" | tee $n3s.out
    else
        echo "eye --nope --quiet $n3s > $n3s.out 2> /dev/null"
        timeout 10s eye --nope --quiet $n3s > $n3s.out 2>&1 
    fi
done

for f in $(find . -name "*.out" | sort) ; do
    if [[ $f =~ examples ]]; then 
        continue
    fi

    echo -n "Testing $f ... "

    if [[ $f =~ FAIL ]] && [[ $(grep ' inference_fuse' $f) ]]; then
        echo -e "${GREEN}OK${NORMAL}"
        ((OK++))
    elif [[ $f =~ SKIP ]]; then
        echo -e "${PINK}SKIPPED${NORMAL}"
        ((SKIPPED++))
    elif [[ $(grep '.*:test.*is.*true' $f) ]]; then
        echo -e "${GREEN}OK${NORMAL}"
        ((OK++))
    elif [[ $(grep '() log:onAnswerSurface true' $f) ]]; then
        echo "OK"
        ((OK++))
    else
        echo -e "${RED}FAILED${NORMAL}"
        ((FAILED++))
    fi
done

echo -e "Results: ${GREEN}${OK} OK${NORMAL}, ${RED}${FAILED} FAILED${NORMAL}, ${PINK}${SKIPPED} SKIPPED${NORMAL}"

if [[ ${FAILED} -eq 0 ]]; then 
    exit 0
else    
    exit 2
fi
