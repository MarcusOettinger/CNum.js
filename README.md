
#  Class CNum

CNum.js is a javascript object plotting a representation of a number z in the
complex plane. The idea is to set a complex value via an algebraic expression,
transform it into different bases and draw a Gaussian plot (aka Argand
diagram). Here's a [demo page]{https://MarcusOettinger.github.io/CNum.js/}.  
License: [the MIT License]{http://opensource.org/licenses/MIT}.  
  
  
Graphics are drawn onto a html5 canvas - this should nowadays be supported by
most browsers.  
  
I wrote the code because I needed a dynamic plot of complex values in webpages
for a a basic maths lecture. It serves a purpose and is far from being cleanly
written, nicely formatted or similar.  
  
CNum.js uses some external libraries:

  * [http://jquery.org](jquery)
  * [http://calebevans.me/projects/jcanvas/] (mathjs) (drawing routines)
  * [http://mathjs.org] (mathjs) (that can do much more!)
Creates a CNum object - the complex value is set via an algebraic expression.  
  
Usage is simple: object = new CNum( expression ) creates a new complex number,  
e.g. **_ z = new CNum("2+i"); _**    will create **_z_** with the value
**_2+i_**  
.  
For further information see the CNum.js [documentation](doc/index.html).

## Installation

Clone the repository or get a package and include the file LNum.js after
jquery. That's it.

## Licensing

This project is licensed under the terms of the 
[MIT license](LICENSE.md).
