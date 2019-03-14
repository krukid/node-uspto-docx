#!/bin/bash

INVALID_COUNT=0

testPDFDir() {
    local _IDENT="$1"
    local _PATH="$2"
    local _PDFS
    echo "[$_IDENT] Indexing ${_PATH}..."
    IFS=$'\n' _PDFS=($(find "${_PATH}" -name "*.pdf"))
    echo "[$_IDENT] Indexing completed (${#_PDFS[@]} PDFs found)"

    echo "[$_IDENT] Testing..."
    for f in "${_PDFS[@]}"; do
        gs -dNOPAUSE -dBATCH -dDEBUG -dPDFSTOPONWARNING -sDEVICE=nullpage "$f" &> /dev/null
        if [[ "$?" != "0" ]]; then
            echo "[$_IDENT] INVALID PDF: $f"
            INVALID_COUNT=$((INVALID_COUNT + 1))
        fi
    done
    echo "[$_IDENT] Processing completed."
}

echo "Testing PDFs for errors..."

testPDFDir join ./output/test-merge/190211-join-b
#testPDFDir split ./output/test-merge/190213-split-a

echo "Done. Invalid PDFs: ${INVALID_COUNT}"
