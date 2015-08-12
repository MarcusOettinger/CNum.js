// M. Oettinger 04/2015, Marcus -at- oettinger-physics.de
//
/** 
 *  @file CNum.js: sketch the complex plane in a html5 canvas
 *  @author Marcus Oettinger
 *  @version 0.3.1
 * @license MIT (see {@link http://opensource.org/licenses/MIT} or LICENSE.txt).
 */
/**
 * @fileoverview 
 * CNum.js is a javascript object to display a complex  number z as a string
 * in different bases or to plot a vector-like diagram of z in the complex plane.
 * The idea is to set a complex value via algebraic Expression  (not necessarily
 * as a sum of real and imaginary part) and convert the complex number into
 * different representations or a Gaussian plot (aka Argand
 * diagram). Graphics are drawn onto a html5 canvas - this should nowadays
 * be supported  by most browsers.<br><br>
 * I wrote the code because I needed a dynamic Argand diagram in webpages
 * for a a basic maths lecture. It serves a purpose and is far from
 * being cleanly written, nicely formatted or similar. If you like it, use it, If you don't
 * - guess what :-)
 * 
 * @class Constructor for a CNum - the complex value is set via an algebraic expression.
 * usage: object = new CNum( expression ) creates a new complex number, e.g.
 *        z = new CNum("2+i");
 * 
 * CNum.js uses some external libraries:
 *
 * - jquery: {@link http://jquery.org}
 * - jcanvas: {@link http://calebevans.me/projects/jcanvas/} (drawing routines)
 * - mathjs: {@link http://mathjs.org} (that can do much more!)
 * @param {string} expr - a text representing a complex number (parsed by mathjs, e.g. '2+3i', '12*exp(3i)')
*/
function CNum(expr) {
        // Private:
        // -----------------------------------------------------------------------------
        // paranoia mode: some reasonable defaults
        var _margin = 50;	// margin around the plot
        var X_C = 100;		// center coordinates
        var Y_C = 100;		// (will be overwritten by setScale)
        var _plotW;
        var _plotH;
        var _SCALE = 10.0;	//
        var _maxradius = 1;	// (value the plot was autoscaled to)
        var _tickLength= 3;	//
        var _daCanvas = null;	// the canvas to use
        var _count = 0;		// count the number of arrows on cnv - needed to display
			// angles in a readable form
        var _TICKSCALE= 0.001;

        // default options - values are settable for every number displayed
        var _defaults = { 
            		// general plot options
            		clear: false, 		// clear canvas
            		coords: false, 		// draw coordinate system

            		// options for complex numbers
            		Arrow: true, 		// draw an arrow - if set to false, draw a point
            		circle: false, 		// draw a circle with radius |z|
            		ReIm: true, 		// show real and imaginary part
            		Ctext: true,		// print z in cartesian notation
            		arc: true, 		// show angle and value as an arc

            		// colors
            		color: "#888", 		// color to use for arrow, text, angle
            		colarrow: false 		// colored arrow and text (default is black)
        };


        // math magic miracles...
        zStr = math.eval( expr );			// eval expression expr to create an
					// expression mathjs can handle for sure...
        this.zNum = math.complex(zStr);		// ... and create a complex number
        this.x = math.round(this.zNum.re, 3);	// store Re(z) and Im(z) for later
        this.y = math.round(this.zNum.im, 3);	//
        var _radius = this.zNum.toPolar().r;		// find absolute value (radius)
        var _a = this.zNum.toPolar().phi;		// get angle phi - bummer:
        this.angle = _a<0?2*Math.PI+_a:_a; 		// mathjs treats angles > PI as negative
						//  - great for calculations but
						// B*A*D if drawing polar plots...  

        // calculate cartesian coordinates of a given point (x/y) on the canvas
        function _XScaled(x) { return _SCALE * x; };
        function _YScaled(y) { return _SCALE * y; };
        function _XPos(x) { return X_C + _XScaled(x); };
        function _YPos(y) { return Y_C - _YScaled(y); };

        // return the sign of a number x (this ought to be fast and safe)
        function sign(x) { return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN; }
        // return the largest of three values
        function getmax(v1, v2, v3) { m = v1>v2?v1:v2; return v3>m?v3:m; };

        // return minimum in the sense of: b if b<a, a otherwise.
        function min(a,b){ if (b<a){ return b; } return a; };

        // return maximum in the sense of: b if b>a, a otherwise.
        function max(a,b){ if (b>a){ return b; } return a; };

        // SetScale: calculate a reasonable scale for the canvas to plot a complex number
        // with given radius
        // (used by displayGauss() and displayGaussWithRadius()).
        function setScale(maxradius) {
                    X_C = _daCanvas.width() / 2;
                    Y_C = _daCanvas.height() / 2;
                    _plotW = _daCanvas.width() - 2 * _margin;
                    _plotH = _daCanvas.height() - 2 * _margin;
                    _SCALE = min(_plotW, _plotH) / (2 * maxradius);
                    _maxradius = maxradius;

                    while (maxradius/_TICKSCALE > 10) {
                       _TICKSCALE= _TICKSCALE*10; 
                    }
                    if (_TICKSCALE >10) _TICKSCALE= _TICKSCALE*2;
        } // SetScale


        // drawticks(pos): draw ticks on x-and y-axis at position x = pos / y = pos
        // (internal function used by axis())
        //
        function drawticks(pos) {
                _daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
                        endArrow: false, x1: _XPos(pos) , y1: Y_C, x2: _XPos(pos), y2: Y_C + _tickLength });
                _daCanvas.drawText({ strokeStyle: '#000', strokeWidth: 1,
                        x: _XPos(pos), y: Y_C+10, fontSize: 10, fontFamily: 'serif',
                        text: pos });
                _daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
                        endArrow: false, x1: X_C , y1: _YPos(pos), x2: X_C - _tickLength, y2:                                                         _YPos(pos) });
                _daCanvas.drawText({ strokeStyle: '#000', strokeWidth: 1,
                        x: X_C-20, y: _YPos(pos)+3, fontSize: 10, fontFamily: 'serif',
                        text: pos });
        }; // drawticks

        // draw axes for a cartesian coordinate system
        //
        function axis(){
               if (_daCanvas == null) return;

               _daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
                       endArrow: true, arrowRadius: 10, arrowAngle: 90, 
                       x1: _margin, y1: Y_C, x2: _plotW + _margin , y2: Y_C });
               _daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
                       endArrow: true, arrowRadius: 10, arrowAngle: 90,
                       x1: X_C, y1: _plotH+_margin,  x2: X_C, y2: _margin });
                for ( i=_TICKSCALE; i<=_maxradius; i+=_TICKSCALE) {
                    drawticks(i);
                }
        }; // axis


        // draw x/y, real and imaginary part using thin lines and style
        // 
        function drawReIm(x, y, style) {
                xpos = _XPos(x);
                ypos = _YPos(y);
                // Draw arrow from center to P(xpos, ypos)
                _daCanvas.drawLine({ strokeStyle: style, strokeWidth: 1,
                        x1: xpos, y1: Y_C, x2: xpos, y2: ypos });
                _daCanvas.drawLine({ strokeStyle: style, strokeWidth: 1,
                        x1: X_C, y1: ypos, x2: xpos, y2: ypos });
        }; // drawReIm



        // draw a complex number z= x + iy in gaussian / argand plane.
        // (polar representation of coordinates x/y in cartesian system.
        // x,y is the starting point of the free vector to draw.
        // as arrow/vector)
        //
        function drawz(z, settings, xstart, ystart) {
                // Draw arrow from A(xstart, ystart) to B(xpos, ypos)
                xpos = _XPos(z.x);
                ypos = _YPos(z.y);
                x = _XScaled(xstart);
                y = _YScaled(ystart);

                style = settings.colarrow?settings.color:"#000";
                if (settings.Arrow)
                    _daCanvas.drawLine({ strokeStyle: style, strokeWidth: 2, rounded: false,
                        endArrow: true, arrowRadius: 10, arrowAngle: 45, 
                        x1: X_C + x, y1: Y_C - y, x2: xpos + x, y2: ypos - y });
                else
                    _daCanvas.drawRect({ strokeStyle: style, strokeWidth: 2, fromCenter: true,
                       x: xpos, y: ypos, width: 5, height: 5 });

                if (settings.Ctext) 
                    _daCanvas.drawText({ strokeStyle: style, strokeWidth: 1,
                            x: xpos + x +10, y: ypos-(sign(z.y)*10) - y, fontSize: 12, fontFamily: 'serif',
                            text: 'z =' + math.complex(z.x, z.y).toString() });
        }; //drawz



        // drawAngle: draw an angle of the arrow (mathematically starting from x-axis)
        function drawAngle(angle, settings) {

                style = settings.colarrow?settings.color:"#000";

                _daCanvas.drawArc( { strokeStyle: style, x: X_C, y: Y_C,
                        radius: 50+ _count*2, start: (Math.PI/2-angle), end: Math.PI/2, inDegrees: false });
                tx = X_C + 30*math.cos(angle - Math.PI/6);
                ty = Y_C - 30*math.sin(angle - Math.PI/6);
                _daCanvas.drawText({ strokeStyle: style, strokeWidth: 1,
                        x: tx,  y: ty, fontSize: 12, fontFamily: 'serif', text: math.round(angle,2) });
        }; // drawAngle


        // draw a circle with radius |z| (to clarify the picture of rotating pointers)
        function circ() {
                if (_daCanvas == null) return;
                _daCanvas.drawArc({ draggable: false, strokeStyle: '#999', strokeWidth: 1, 
                     x: X_C, y: Y_C, radius: (_radius * _SCALE)
                });
        }; // circ


        // =======================================================
        // Public:
        // =======================================================
        // return radius of the complex cartesian x+iy in gaussian plane
        this.getradius = function() { return _radius;  };


        // Return complex number z in cartesian coordinates as html string.
        //
        /** HTML of the complex number z in cartesian representation (e.g. '1+2i')
         *  @return a string containing a complex number in its simplest form.
         */
        this.ToCartesian = function() {
                retval = this.zNum.format(3);
                return retval;
        };

        // Return complex conjugate as html.
        //
        /** HTML of the complex conjugate z* in cartesian representation (e.g. '1-2i')
         *  @return a string containing a complex conjugate.
         */
        this.ToCC = function() {
                retval = math.conj(this.zNum).format(3);
                return retval;
        };

 
        // Return norm as html.
        //
        /** HTML of the norm (length of the vector) of the complex number z (e.g. '2.236')
         *  @return a string containing a real number.
         */
        this.ToR = function() {
                retval = math.round(this.zNum.toPolar().r,3);
                return retval;
        };

        // Return complex number z in trigonometric representation as html.
        //
        /** HTML of the complex number z in trigonometric representation (e.g. '2.236(cos(1.107) + i &middot; sin(1.107))')
         *  @return a string containing a complex number as a mathematical expression.
         */
        this.ToTrigonometric = function() {
                rad = math.round(this.zNum.toPolar().r,3);
                phi = math.round(this.zNum.toPolar().phi,3);
                retval = rad + "&middot;(cos(" + phi + ") + i &middot;sin(" + phi +"))";
                return retval;
        };

        // Return complex number z in polar coordinates as html.
        //
        /** HTML of the complex number z in polar representation (e.g. '2.236 e<sup>i 1.107</sup>'')
         *  @return a string containing a complex number in polar coordinates.
         */
        this.ToPolar = function() {
                rad = math.round(this.zNum.toPolar().r,3);
                phi = math.round(this.zNum.toPolar().phi,3);
                retval = rad + "&middot; e<sup>i " + phi + "</sup>";
                return retval;
        };

        // the good stuff: Graphics
        // -----------------------------------------------------------------------------
        /** Set the canvas to plot on
         * @param {canvas object} cnv - the html canvas to draw on (conveniently selected via jquery).
         */
        this.setCanvas = function( cnv ) {  _daCanvas = cnv; };

        // get cartesian coordinates of a given point (x/y) on the canvas
        this.getXPos = function(x) { return _XPos(x); };
        this.getYPos = function(y) { return _YPos(y); };


        // add product of zs to plot - add to existing plot
        this.multiplyCNum =function(z2, options, resultoptions){
            resultoptions = ( typeof resultoptions == 'undefined' ? options : resultoptions);

            // calculate resulting value z = this + z2
            res = new CNum( math.multiply(this.zNum, z2.zNum).toString() );

            // replot this and rescale to largest absolute value
            this.displayGauss(options, getmax(this.getradius(), z2.getradius(), res.getradius()));	
            this.addToPlot(z2, options);		// multiplication of this and s2
            this.addToPlot(res, resultoptions);		// display the result
            return res;
        }


        // add sum of zs to plot - add to existing plot
        this.addCNum =function(_zToAdd, options, resultoptions){
            resultoptions = ( typeof resultoptions == 'undefined' ? options : resultoptions);

            // calculate resulting value z = this + _zToAdd
            res = new CNum( this.zNum.toString() + "+" + _zToAdd.zNum.toString() );
            // replot this and rescale to largest absolute value
            this.displayGauss(options, getmax(this.getradius(), _zToAdd.getradius(), res.getradius()));	

            this.addVector(_zToAdd, this.x, this.y, options);		// vector addition of this and _zToAdd
            this.addToPlot(res, resultoptions);			// display the result
            return res;
        }
        

        /** add a CNum to an existing plot - may be used to plot several numbers an the same canvas at the same time.
        * Caveat: the plot will not be rescaled nor cleared (of course).
        * @param {boolean} clear (ignored)
        * @param {boolean} coords (ignored)
        * @param {boolean} circle (ignored)
        * @param {boolean} ReIm - Show real and imaginary parts by thin vertical/horizontal lines in color (see below, default: true)
        * @param {string} color - a color in html notation (default "#888")
        * @param {boolean} colarrow - draw arrow in color if set (default: black arrow)
        */
        this.addToPlot = function( z, options ) {
                // handle defaults
//                var defaults = { clear: false, coords: false, circle: false, ReIm: true, color: "#888", colarrow: false, arc: true };
                var settings = $.extend( {}, _defaults, options );
                if (settings.arc) drawAngle(z.angle, settings);
                if (settings.ReIm) drawReIm(z.x, z.y, settings.color);

                drawz( z, settings, 0, 0 );
                _count++;
        }; // addToPlot

        /** add a CNum as a free vector to an existing plot - may be used to plot several numbers an the same canvas at the same time. This method plots a CNum starting at a certain point (instead of 0/0), for example to display sums of complex numbers.
        * Caveat: the plot will not be rescaled nor cleared (of course).
        * @param {CNum} z - the complex number to add
        * @param {coordinate} x,y coordinates of the starting point
        * @param {boolean} clear (ignored)
        * @param {boolean} coords (ignored)
        * @param {boolean} circle (ignored)
        * @param {boolean} ReIm - Show real and imaginary parts by thin vertical/horizontal lines in color (see below, default: true)
        * @param {string} color - a color in html notation (default "#888")
        * @param {boolean} colarrow - draw arrow in color if set (default: black arrow)
        */

        this.addVector = function( z, x, y, options ) {
                var settings = $.extend( {}, _defaults, options );
                if (settings.arc) drawAngle(z.angle, settings);
                if (settings.ReIm) drawReIm(z.x, z.y, settings.color);
               drawz( z, settings, x , y );
                _count++;
        }; // addToPlot



        // * clear canvas and draw 
        // 
        /** Draw the complex number z as an arrow in the complex plane on the canvas set by
         *@see setCanvas. This function should be used to either plot a single CNum or to plot
         *the first in a series of CNums onto the same canvas. Additional numbers can be displayed
         * on a canvas using
         * @see addToPlot
         * @param {boolean} clear - Clear canvas before displaying complex number if set (default: true)
         * @param {boolean} coords - Draw a cartesian coordinate system if set (default: true)
         * @param {boolean} circle - Draw a circle with radius |z| (this is poor man's rotating pointer, default: true)
         * @param {boolean} ReIm - Show real and imaginary parts by thin vertical/horizontal lines in color (see below, default: true)
        * @param {boolean} color - a color in html notation (default "#888")
        * @param {boolean} colarrow - draw arrow in color if set (default: black arrow)
        * @param {optional number} radius scale the plot for a complex number of this value (default: autoscale)
        */
        this.displayGauss = function(options, radius){
                // handle defaults
                maxR = ( typeof radius == 'undefined' ? _radius : radius);
                var settings = $.extend( {}, _defaults, { clear:true, coords: true, circle: true }, options );

                setScale(maxR);
                if (settings.clear) {
                    _daCanvas.clearCanvas();
                    _count = 0;
                }
                if (settings.coords) axis();
                if (settings.circle) circ();

                this.addToPlot(this, settings); 
        };

        // return a brandnew CNum :-)
        return this;

}; // -- CNum --
