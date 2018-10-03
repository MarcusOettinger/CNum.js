#
# Makefile creating jsdoc v2 documentation and a README.md for
# CNum.js (marcusoettinger.github.io/CNum.js)
#
all: minified doc

minified: CNum.js
	yui-compressor -o CNum.min.js CNum.js
	cp CNum.js CNum.min.js ../gh-pages/CNum.js/

doc: CNum.js
	jsdoc -d ./doc/ CNum.js
