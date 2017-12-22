#!/bin/bash

calc() {
    awk "BEGIN {print $1}"
}

when() {
    date -d @$1
}

# find all json files in cache, map to absolute access times without fractions
TIMES=$(find /app/output/cache -name \*.json -printf '%A@\n' | cut -d. -f 1)

# retrieve earliest access time for a json item
TIME0=$(echo "$TIMES" |sort -n|head -n1)

# save current absolute time
TIME1=$(date +%s)

# eval absolute time passed since first access
DIFF=$(calc "$TIME1 - $TIME0")
DIFF_HOURS=$(calc "$DIFF / 3600")

# calculate total item count
COUNT=$(echo "$TIMES" |wc -l)
COUNT_EST=25000
REMAIN=$(calc "$COUNT_EST - $COUNT")

# calculate average time per item
TIME_F=$(calc "$DIFF / $COUNT")

ETA_DIFF=$(calc "$REMAIN * $TIME_F")
ETA_HOURS=$(calc "$ETA_DIFF / 3600")
ETA_TIME=$(calc "int($TIME1 + $ETA_DIFF + 0.5)")

echo -e "ETA\t: $(when $ETA_TIME) ($ETA_HOURS Hours)"
echo -e "Elapsed\t: $DIFF ($DIFF_HOURS Hours)"
echo -e "Remain\t: $REMAIN"
echo -e "Count\t: $COUNT"
echo -e "Start\t: $(when $TIME0)"
echo -e "Now\t: $(when $TIME1)"
echo -e "Step\t: $TIME_F"
