#
# Makefile creating jsdoc v2 documentation and a README.md for
# CNum.js (marcusoettinger.github.io/CNum.js)
#
#
# jsdoc (use v3+)
JSDOC = jsdoc
docdir = ./doc 

all: minified doc

love:
	echo "Not war?"

minified: CNum.js
	yui-compressor -o CNum.min.js CNum.js
	cp CNum.js CNum.min.js ../gh-pages/CNum.js/

doc: CNum.js
	$(JSDOC) -d $(docdir)/ CNum.js
	cp -R $(docdir) ../gh-pages/

clean: 
	test -d $(docdir) && rm -rf $(docdir)
