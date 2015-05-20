#
#
all: doc


doc: CNum.js
	jsdoc ./CNum.js -d=out
