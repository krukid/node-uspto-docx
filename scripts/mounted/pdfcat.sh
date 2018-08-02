#!/bin/bash

#IN_PATH=./output/test-merge/0718-split
#OUT_PATH=./output/test-merge/0718-join
IN_PATH='./output/test-merge/0718-split/no-color/199910$[RD] AND LIVE[LD]/forms-pdf/usa'
OUT_PATH=./output/test-merge/0718-test

# shopt -s nullglob

echo "Indexing ${IN_PATH}..."
# IFS=$'\n' PDFS=($(find $IN_PATH -maxdepth 2 -name "*.pdf"))
IFS=$'\n' PDFS=($(find "${IN_PATH}" -name "*.pdf"))
echo "Indexing completed (${#PDFS[@]} PDFs found)"

BUFMAX=1500
BUFFER=()
DIR=

flush() {
    if [[ "${#BUFFER[@]}" -gt 0 ]]; then
        NAME_FROM=$(basename "${BUFFER[0]}" .pdf)
        NAME_TO=$(basename "${BUFFER[-1]}" .pdf)
        DIR_CAT="${OUT_PATH}${DIR#"$IN_PATH"}"
        PATH_CAT="${DIR_CAT}/${NAME_FROM}_${NAME_TO}.pdf"

        echo "FLUSHING: ${#BUFFER[@]} > ${PATH_CAT}"
        mkdir -p "$DIR_CAT" && \
            gs -q \
                -sOUTPUTFILE="$PATH_CAT" \
                -sDEVICE=pdfwrite \
                -dNOPAUSE \
                -dPDFSETTINGS=/prepress \
                -dOPTIMIZE=false \
                -dCompressPages=false \
                -dCompatibilityLevel=1.4 \
                -dEmbedAllFonts=true \
                -dSubsetFonts=false \
                -dPostRenderingEnhance=false \
                -dPreRenderingEnhance=false \
                -dBATCH ${BUFFER[@]}

        BUFFER=()

        echo "******* FLUSHED OK"
        # sleep 10
    fi
}

echo "Processing..."
for f in "${PDFS[@]}"; do
    NEWDIR=$(dirname "$f")
    # echo "* $f // $NEWDIR === $DIR // ${#BUFFER[@]}"
    if [[ "${#BUFFER[@]}" -ge $BUFMAX ]] || [[ "$DIR" != "$NEWDIR" ]]; then
        # [[ "${#BUFFER[@]}" -ge $BUFMAX ]]  && echo buf overflow
        # [[ "$DIR" != "$NEWDIR" ]] && echo dir change
        flush
    fi
    BUFFER+=("$f")
    DIR="$NEWDIR"
done
flush
echo "Processing completed."