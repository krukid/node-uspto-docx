# option A
mkdir -p pdf && lowriter --headless --convert-to pdf  --outdir pdf *.docx

# option B
apt-get install unoconv
doc2pdf some.docx
