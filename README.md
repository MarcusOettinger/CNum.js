[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

#  Class CNum

CNum.js is a javascript object plotting a representation of a number z in the
complex plane. The idea is to set a complex value via an algebraic expression,
transform it into different bases and draw a Gaussian plot (aka Argand
diagram). Here's a [demo page](https://MarcusOettinger.github.io/CNum.js/ "Demo page").  
 
Graphics are drawn onto a html5 canvas - this should nowadays be supported by
most browsers.  
  
I wrote the code because I needed a dynamic plot of complex values in webpages
for a a basic maths lecture. It serves a purpose and is far from being cleanly
written, nicely formatted or similar.  
  
CNum.js uses one external library:
  * [mathjs](http://mathjs.org) (that can do much more!)  
  
Usage is simple: object = new CNum( expression ) creates a new CNum object - the
complex value is set via an algebraic expression. For example,
**_ z = new CNum("2+i"); _**    will create **_z_** with the value
**_2+i_**.

For further information see the CNum.js [documentation](doc/index.html).

## Installation

Clone the repository or get a package and include the file CNum.js after
mathjs. That's it.

## Licensing

This project is licensed under the terms of the 
[MIT license](LICENSE.md).
