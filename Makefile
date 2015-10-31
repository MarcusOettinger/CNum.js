#
#
#
all: doc doc-markdown

doc-markdown: doc
	html2markdown out/symbols/CNum.html | tail -n +11 > README.md

doc: CNum.js
	jsdoc CNum.js -d=out
