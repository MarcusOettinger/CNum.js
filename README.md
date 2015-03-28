[Class Index](../index.html) | [File Index](../files.html)

* * * * *

Classes
-------

-   *[\_global\_](../symbols/_global_.html)*
-   [CNum](../symbols/CNum.html)

* * * * *

Class CNum
==========

*Defined in:* [CNum.js](../symbols/src/CNum.js.html).

Class Summary

Constructor Attributes

Constructor Name and Description

 

**[CNum](../symbols/CNum.html#constructor)**(expr)

Constructor for a CNum - the complex value is set via an algebraic expression.

Method Summary

Method Attributes

Method Name and Description

 

**[addToPlot](../symbols/CNum.html#addToPlot)**(clear, coords, circle, ReIm, color, colarrow)

add a CNum to an existing plot - may be used to plot several numbers an the same canvas at the same time.

 

**[addVector](../symbols/CNum.html#addVector)**(z, x,y, clear, coords, circle, ReIm, color, colarrow)

add a CNum as a free vector to an existing plot - may be used to plot several numbers an the same canvas at the same time.

 

**[displayGauss](../symbols/CNum.html#displayGauss)**(clear, coords, circle, ReIm, color, colarrow, radius)

Draw the complex number z as an arrow in the complex plane on the canvas set by

 

**[setCanvas](../symbols/CNum.html#setCanvas)**(cnv)

Set the canvas to plot on

 

**[ToCartesian](../symbols/CNum.html#ToCartesian)**()

HTML of the complex number z in cartesian representation (e.g.

 

**[ToCC](../symbols/CNum.html#ToCC)**()

HTML of the complex conjugate z\* in cartesian representation (e.g.

 

**[ToPolar](../symbols/CNum.html#ToPolar)**()

HTML of the complex number z in polar representation (e.g.

 

**[ToR](../symbols/CNum.html#ToR)**()

HTML of the norm (length of the vector) of the complex number z (e.g.

 

**[ToTrigonometric](../symbols/CNum.html#ToTrigonometric)**()

HTML of the complex number z in trigonometric representation (e.g.

Class Detail

**CNum**(expr)

Constructor for a CNum - the complex value is set via an algebraic expression.usage: object = new CNum( expression ) creates a new complex number, e.g. z = new CNum("2+i");

Parameters:
 {string} **expr**   
- a text representing a complex number (parsed by mathjs, e.g. '2+3i', '12\*exp(3i)')

Method Detail

**addToPlot**(clear, coords, circle, ReIm, color, colarrow)

add a CNum to an existing plot - may be used to plot several numbers an the same canvas at the same time.Caveat: the plot will not be rescaled nor cleared (of course).

Parameters:
 {boolean} **clear**   
(ignored)

 {boolean} **coords**   
(ignored)

 {boolean} **circle**   
(ignored)

 {boolean} **ReIm**   
- Show real and imaginary parts by thin vertical/horizontal lines in color (see below, default: true)

 {string} **color**   
- a color in html notation (default "\#888")

 {boolean} **colarrow**   
- draw arrow in color if set (default: black arrow)

* * * * *

**addVector**(z, x,y, clear, coords, circle, ReIm, color, colarrow)

add a CNum as a free vector to an existing plot - may be used to plot several numbers an the same canvas at the same time. This method plots a CNum starting at a certain point (instead of 0/0), for example to display sums of complex numbers.Caveat: the plot will not be rescaled nor cleared (of course).

Parameters:
 {[CNum](../symbols/CNum.html)} **z**   
- the complex number to add

 {coordinate} **x,y**   
coordinates of the starting point

 {boolean} **clear**   
(ignored)

 {boolean} **coords**   
(ignored)

 {boolean} **circle**   
(ignored)

 {boolean} **ReIm**   
- Show real and imaginary parts by thin vertical/horizontal lines in color (see below, default: true)

 {string} **color**   
- a color in html notation (default "\#888")

 {boolean} **colarrow**   
- draw arrow in color if set (default: black arrow)

* * * * *

**displayGauss**(clear, coords, circle, ReIm, color, colarrow, radius)

Draw the complex number z as an arrow in the complex plane on the canvas set by

Parameters:
 {boolean} **clear**   
- Clear canvas before displaying complex number if set (default: true)

 {boolean} **coords**   
- Draw a cartesian coordinate system if set (default: true)

 {boolean} **circle**   
- Draw a circle with radius |z| (this is poor man's rotating pointer, default: true)

 {boolean} **ReIm**   
- Show real and imaginary parts by thin vertical/horizontal lines in color (see below, default: true)

 {boolean} **color**   
- a color in html notation (default "\#888")

 {boolean} **colarrow**   
- draw arrow in color if set (default: black arrow)

 {optional number} **radius**   
scale the plot for a complex number of this value (default: autoscale)

See:  
setCanvas. This function should be used to either plot a single CNum or to plotthe first in a series of CNums onto the same canvas. Additional numbers can be displayedon a canvas using

addToPlot

* * * * *

**setCanvas**(cnv)

Set the canvas to plot on

Parameters:
 {canvas object} **cnv**   
- the html canvas to draw on (conveniently selected via jquery).

* * * * *

**ToCartesian**()

HTML of the complex number z in cartesian representation (e.g. '1+2i')

Returns:  
a string containing a complex number in its simplest form.

* * * * *

**ToCC**()

HTML of the complex conjugate z\* in cartesian representation (e.g. '1-2i')

Returns:  
a string containing a complex conjugate.

* * * * *

**ToPolar**()

HTML of the complex number z in polar representation (e.g. '2.236 e<sup>i\\ 1.107</sup>'')

Returns:  
a string containing a complex number in polar coordinates.

* * * * *

**ToR**()

HTML of the norm (length of the vector) of the complex number z (e.g. '2.236')

Returns:  
a string containing a real number.

* * * * *

**ToTrigonometric**()

HTML of the complex number z in trigonometric representation (e.g. '2.236(cos(1.107) + i · sin(1.107))')

Returns:  
a string containing a complex number as a mathematical expression.

* * * * *

Documentation generated by [JsDoc Toolkit](http://code.google.com/p/jsdoc-toolkit/) 2.4.0 on Fri Mar 27 2015 22:53:06 GMT+0100 (MEZ)

