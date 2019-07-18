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

testPDFPages() {
  local _IDENT="$1"
  local _PATH="$2"
  local _PDFS
  echo "[$_IDENT] Indexing ${_PATH}..."
  IFS=$'\n' _PDFS=($(find "${_PATH}" -name "*.pdf"))
  echo "[$_IDENT] Indexing completed (${#_PDFS[@]} PDFs found)"

  echo "[$_IDENT] Counting pages..."
  local _SUM=0
  for f in "${_PDFS[@]}"; do
    local _COUNT=$(gs -q -dNODISPLAY -c "(${f}) (r) file runpdfbegin pdfpagecount = quit")
    echo "[$_IDENT] $f => $_COUNT"
    _SUM=$((_SUM + _COUNT))
  done
  echo "[$_IDENT] Processing completed, total pages found: ${_SUM}."
}

echo "Testing PDFs for errors..."

testPDFDir join ./output/test-merge/190717-join-b2
testPDFPages join ./output/test-merge/190717-join-b2

#testPDFDir split ./output/test-merge/190418-split-b

echo "Done. Invalid PDFs: ${INVALID_COUNT}"
