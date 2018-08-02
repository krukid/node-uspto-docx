#!/bin/bash

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
        fi
    done
    echo "[$_IDENT] Processing completed."
}

testPDFDir split ./output/test-merge/0718-split
testPDFDir join ./output/test-merge/0718-join

echo "Done."
