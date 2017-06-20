#!/bin/bash

# # option A
# mkdir -p pdf && lowriter --headless --convert-to pdf  --outdir pdf *.docx

# # option B
# apt-get install unoconv
# doc2pdf some.docx

# old cmd
# [ $(ls -1 | wc -l) -gt 0 ] && lowriter --headless --convert-to pdf --outdir ${pdfDir} *.docx

outdir="$1"

shopt -s nullglob

for f in *.docx; do
  pdf_path=$(echo "$outdir/$f" | sed s/\.docx$/.pdf/)
  echo "converting $f to $pdf_path"

  if [[ -f $pdf_path ]]; then
    echo "$pdf_path already exists, skipping..."
  else
    lowriter --headless --convert-to pdf --outdir "$outdir" "./$f"
  fi
done
