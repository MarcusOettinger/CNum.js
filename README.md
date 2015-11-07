
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

  * [jquery]{http://jquery.org}
  * [jcanvas]{http://calebevans.me/projects/jcanvas/} (drawing routines)
  * [mathjs]{http://mathjs.org} (that can do much more!)
Creates a CNum object - the complex value is set via an algebraic expression.  
  
Usage is simple: object = new CNum( expression ) creates a new complex number,  
e.g. **_ z = new CNum("2+i"); _**    will create **_z_** with the value
**_2+i_**  
.  
_Defined in: _ CNum.js.

Class Summary Constructor Attributes | Constructor Name and Description  
---|---  
  |

**CNum**(expr)   
  
Method Summary Method Attributes | Method Name and Description  
---|---  
  |

**addCNum**(z2, options, resultoptions) 

show the sum of two complex numbers in a Gaussian plot.  
  
  |

**addToPlot**(z, options) 

add a CNum to an existing plot - may be used to plot several numbers on one
canvas at the same time.  
  
  |

**addVector**(z, x,y, change, options) 

add a CNum as a free vector to an existing plot - used to plot several numbers
on a single canvas.  
  
  |

**displayGauss**(options, radius) 

Draw the complex number z as an arrow in the complex plane on the selected
canvas (set by setCanvas()).  
  
  |

**getradius**() 

Return radius of the pointer  
  
  |

**multiplyCNum**(z2, options, resultoptions) 

multiply two complex numbers in a Gaussian plot.  
  
&lt;static&gt;   |

CNum.**options**(options)

Options used to change the appearance of a plot.  
  
  |

**setCanvas**(cnv) 

Set the canvas to plot on  
  
  |

**ToCartesian**() 

Return a string of the complex number z in cartesian representation (e.g.  
  
  |

**ToCC**() 

Return a string of the complex conjugate z* in cartesian representation (e.g.  
  
  |

**ToPolar**() 

Return a string of the complex number z in polar representation (e.g.  
  
  |

**ToR**() 

Return a string of the norm (length of the vector) of the complex number z
(e.g.  
  
  |

**ToTrigonometric**() 

Return a string of the complex number z in trigonometric representation (e.g.  
  
Class Detail

**CNum**(expr) 

Parameters:

{string} **expr**

    a text representing a complex number. Cartesian, trigonometric and polar expressions can be used, e.g. '2+3i' or '12*exp(3i)'   
  

Method Detail

{CNum} **addCNum**(z2, options, resultoptions)

show the sum of two complex numbers in a Gaussian plot.

Parameters:

{CNum} **z2**

    the number to add
{options} **options**

    set appearance of the complex number to add (see CNum.options for a list of possible settings)
{options} **resultoptions**

    change appearance of the resulting complex number (see CNum.options for a list of possible settings)

Returns:

    {CNum} result of the operation as a CNum

* * *

**addToPlot**(z, options) 

add a CNum to an existing plot - may be used to plot several numbers on one
canvas at the same time. Caveat: the plot will not be rescaled nor cleared (of
course).

Parameters:

{CNum} **z**

    the complex number to add to the current plot
{options} **options**

    change plot appearance (see CNum.options for a list of possible settings)

* * *

**addVector**(z, x,y, change, options) 

add a CNum as a free vector to an existing plot - used to plot several numbers
on a single canvas. This method plots a CNum starting at a point (x/y), for
example to display sums of complex numbers. Caveat: the plot will not be
rescaled nor cleared (of course).

Parameters:

{CNum} **z**

    the complex number to add
{coordinate} **x,y**

    coordinates of the starting point
{options} **change**

    plot appearance (see CNum.options for a list of possible settings)
**options**
    

* * *

**displayGauss**(options, radius) 

Draw the complex number z as an arrow in the complex plane on the selected
canvas (set by setCanvas()). This method either plots a single CNum or the
first one in a series of CNums drawn onto the same canvas. Additional numbers
can be displayed on that canvas using addToPlot

Parameters:

{options} **options**

    change plot appearance (see CNum.options for a list of possible settings)
{optional number} **radius**

    scale the plot for a complex number of this value (default: autoscale)

See:

    setCanvas(): Set the canvas to draw on.
    addToPlot(): draw another number into an existing plot.

* * *

{float} **getradius**()

Return radius of the pointer

Returns:

    {float} radius of the complex number (norm)

* * *

{CNum} **multiplyCNum**(z2, options, resultoptions)

multiply two complex numbers in a Gaussian plot.

Parameters:

{CNum} **z2**

    the number to multiply with
{options} **options**

    set appearance of the complex number to multiply with (see CNum.options for a list of possible settings)
{options} **resultoptions**

    change appearance of the resulting complex number (see CNum.options for a list of possible settings)

Returns:

    {CNum} result of the operation as a CNum

* * *

&lt;static&gt; CNum.**options**(options)

Options used to change the appearance of a plot. This set of options is used
in all methods displaying numbers.

Parameters:

{Object} **options**

    
{boolean} **options.clear**

    \- remove canvas contents before drawing
{boolean} **options.coords**

    \- draw a coordinate system
{boolean} **options.Arrow**

    draw _**z**_ as an arrow - if set to false, draw a point. Defaults to true.
{boolean} **options.circle**

    draw a circle with radius _**|z|**_. Defaults to false.
{boolean} **options.ReIm**

    show real and imaginary part in the plot. Default is true.
{boolean} **options.Ctext**

    print _**z**_ in cartesian notation. Defaults to true
{boolean} **options.arc**

    show angle and value as an arc. Default is true.
{string} **options.color**

    set a color to use for arrow, text, angle. Defaults to '#888'.
{boolean} **options.colarrow**

    draw arrow and text in the selected color (default is black).

* * *

**setCanvas**(cnv) 

Set the canvas to plot on

Parameters:

{canvas object} **cnv**

    \- the html canvas to draw on (conveniently selected via jquery).

* * *

{string} **ToCartesian**()

Return a string of the complex number z in cartesian representation (e.g.
'1+2i')

Returns:

    {string} a string containing the simplest form of the complex number **_z = x + i*y_**

* * *

{string} **ToCC**()

Return a string of the complex conjugate z* in cartesian representation (e.g.
'1-2i')

Returns:

    {string} **_z̅_**, a string containing the complex conjugate of **_z_**.

* * *

{string} **ToPolar**()

Return a string of the complex number z in polar representation (e.g. '2.236
ei 1.107')

Returns:

    {string} a string containing the number **_z_** in polar coordinates with a bit of html for the superscripts.

* * *

{string} **ToR**()

Return a string of the norm (length of the vector) of the complex number z
(e.g. '2.236')

Returns:

    {string} a string containing the norm as a real number.

* * *

{string} **ToTrigonometric**()

Return a string of the complex number z in trigonometric representation (e.g.
'2.236(cos(1.107) + i * sin(1.107))')

Returns:

    {string} a string containing the complex number as a mathematical expression in trigonometric notation.

* * *

Documentation generated by JsDoc Toolkit 2.4.0 on Sat Nov 07 2015 17:06:25
GMT+0100 (MEZ)

