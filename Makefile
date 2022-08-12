#
# Makefile creating jsdoc v2 documentation and a README.md for
# CNum.js (marcusoettinger.github.io/CNum.js)
#
#
# jsdoc (use v3+)
JSDOC = jsdoc
JSDOptions = -d
# to document private methods, use
# JSDOptions = -p -d
docdir = ./doc 

all: minified doc

love:
	echo "Not war?"

minified: CNum.js
	yui-compressor -o CNum.min.js CNum.js
	cp CNum.js CNum.min.js ../gh-pages/

doc: CNum.js
	$(JSDOC) $(JSDOptions) $(docdir) CNum.js
	cp -R $(docdir) ../gh-pages/

clean: 
	test -d $(docdir) && rm -rf $(docdir)
