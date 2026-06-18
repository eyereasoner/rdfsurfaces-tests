#!/bin/bash

FILE=$1

if [ "${FILE}" == "" ]; then
   echo "usage: $0 file"
   exit 1
fi

# 1. Refutation on the FOL core (the default backend).
RES=$(juliett --herbrand --check-consistency "${FILE}" 2>/dev/null)

# 2. Fallback: if the FOL core could not refute it, try Spacer (CHC). No-op
# unless the document is a constrained-Horn-over-LIA surface program; on
# anything else juliett bails and RES stays empty.
if [[ ! $RES =~ INCONSISTENT ]]; then
   RES=$(juliett --check-consistency --z3-engine chc "${FILE}" 2>/dev/null)
fi

if [[ $RES =~ INCONSISTENT ]]; then
   echo "Refutation found"
   exit 0
fi

# 3. Otherwise prove the answer triple :test :is true by entailment.
RES=$(juliett --herbrand --entails ./script/juliett-goal.n3 "${FILE}" 2>/dev/null)

if [[ $RES == ENTAILED* ]]; then
   cat ./script/juliett-goal.n3
else
   echo ""
fi
