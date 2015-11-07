// M. Oettinger, Marcus -at- oettinger-physics.de
// Sa 31. Okt 17:22:27 CET 2015
//  revamped jsdoc content
// So 25. Okt 07:53:32 CET 2015
//
/** 
 *  @file CNum.js: sketch the complex plane in a html5 canvas
 *  @author Marcus Oettinger
 *  @version 0.3.1
 *  @license MIT (see {@link http://opensource.org/licenses/MIT} or LICENSE).
 */
/**
 * @class CNum.js
 * is a javascript object plotting a representation of a number z in the complex
 * plane. The idea is to set a complex value via an algebraic expression, 
 * transform it into different bases and draw a Gaussian plot (aka Argand
 * diagram).
 * Here's a [demo page]{https://MarcusOettinger.github.io/CNum.js/}.<br>
 * License: [the MIT License]{http://opensource.org/licenses/MIT}.<br>
 * <br><br>
 * Graphics are drawn onto a html5 canvas - this should nowadays
 * be supported  by most browsers.<br><br>
 * I wrote the code because I needed a dynamic plot of complex values in
 * webpages for a a basic maths lecture. It serves a purpose and is far from
 * being cleanly written, nicely formatted or similar.
 * 
 * <br><br>
 * CNum.js uses some external libraries:
 * <ul>
 * <li>[jquery]{http://jquery.org}</li>
 * <li>[jcanvas]{http://calebevans.me/projects/jcanvas/}
 * (drawing routines)</li>
 * <li>[mathjs]{http://mathjs.org} (that can do much more!)</li>
 * </ul>
 * Creates a CNum object - the complex value is set via an algebraic expression.
 * <br><br>
 * Usage is simple: object = new CNum( expression ) creates a new complex
 * number,<br>
 * e.g. <b><i> z = new CNum("2+i"); </i></b> &nbsp;&nbsp;
 * will create <b><i>z</i></b> with the value <b><i>2+i</i></b><br>.
 * @param {string} expr a text representing a complex number. Cartesian, trigonometric and polar expressions can be used, e.g. '2+3i' or '12*exp(3i)'
 * <br><br>
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
	/**
	 * Options used to change the appearance of a plot. This set of options
	 * is used in all methods displaying numbers.
	 * @name options
	 * @memberOf CNum
	 * @function
         * @param {Object} options
         * @param {boolean} options.clear - remove canvas contents before drawing
         * @param {boolean} options.coords - draw a coordinate system
	 * @param {boolean} options.Arrow draw <i><b>z</b></i> as an arrow - if set to false, draw a point. Defaults to true.
	 * @param {boolean} options.circle draw a circle with radius <i><b>|z|</b></i>. Defaults to false.
	 * @param {boolean} options.ReIm show real and imaginary part in the plot. Default is true.
	 * @param {boolean} options.Ctext print <i><b>z</b></i> in cartesian notation. Defaults to true
	 * @param {boolean} options.arc show angle and value as an arc. Default is true.
	 * @param {string} options.color set a color to use for arrow, text, angle. Defaults to '#888'.
	 * @param {boolean} options.colarrow draw arrow and text in the selected color (default is black).

	 */

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


        // draw a circle with radius |z| 
	// (to clarify the picture of rotating pointers in the complex plane)
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
	/** Return radius of the pointer
	 * @return {float} radius of the complex number (norm)
	 */
        this.getradius = function() { return _radius;  };


        // Return complex number z in cartesian coordinates as html string.
        //
        /** Return a string of the complex number z in cartesian representation (e.g. '1+2i')
         *  @return {string} a string containing the simplest form of the complex number <b><i>z = x + i&middot;y</i></b>
         */
        this.ToCartesian = function() {
                retval = this.zNum.format(3);
                return retval;
        };

        // Return complex conjugate as html.
        //
        /** Return a string of the complex conjugate z* in cartesian representation (e.g. '1-2i')
         *  @return {string} <b><i>z&#773;</i></b>, a  string containing the complex conjugate of <b><i>z</i></b>.
         */
        this.ToCC = function() {
                retval = math.conj(this.zNum).format(3);
                return retval;
        };

 
        // Return norm as html.
        //
        /** Return a string of the norm (length of the vector) of the complex number z (e.g. '2.236')
         *  @return {string} a string containing the norm as a real number.
         */
        this.ToR = function() {
                retval = math.round(this.zNum.toPolar().r,3);
                return retval;
        };

        // Return complex number z in trigonometric representation as html.
        //
        /** Return a string of the complex number z in trigonometric representation (e.g. '2.236(cos(1.107) + i &middot; sin(1.107))')
         *  @return {string} a string containing the complex number as a mathematical expression in trigonometric notation.
         */
        this.ToTrigonometric = function() {
                rad = math.round(this.zNum.toPolar().r,3);
                phi = math.round(this.zNum.toPolar().phi,3);
                retval = rad + "&middot;(cos(" + phi + ") + i &middot;sin(" + phi +"))";
                return retval;
        };

        // Return complex number z in polar coordinates as html.
        //
        /** Return a string of the complex number z in polar representation (e.g. '2.236 e<sup>i 1.107</sup>')
         *  @return {string} a string containing the number <b><i>z</i></b> in polar coordinates with a bit of html for the superscripts.
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
         * @param {canvas object} cnv - the html canvas to draw on
	 * (conveniently selected via jquery).
         */
        this.setCanvas = function( cnv ) {  _daCanvas = cnv; };

        // get cartesian coordinates of a given point (x/y) on the canvas
        this.getXPos = function(x) { return _XPos(x); };
        this.getYPos = function(y) { return _YPos(y); };


        // add product of zs to plot - add to existing plot
	/** multiply two complex numbers in a Gaussian plot.
	 * @param {CNum} z2 the number to multiply with
	 * @param {options} options set appearance of the complex number to multiply with (see {@link CNum.options} for a list of possible settings)
	 * @param {options} resultoptions change appearance of the resulting complex number (see {@link CNum.options} for a list of possible settings)
	 * @return {CNum} result of the operation as a CNum
	 */
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
	/** show the sum of two complex numbers in a Gaussian plot.
	 * @param {CNum} z2 the number to add
	 * @param {options} options set appearance of the complex number to add (see {@link CNum.options} for a list of possible settings)
	 * @param {options} resultoptions change appearance of the resulting complex number (see {@link CNum.options} for a list of possible settings)
	 * @return {CNum} result of the operation as a CNum
	 */
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
        

        /** add a CNum to an existing plot - may be used to plot several
	 *numbers on one canvas at the same time.
         * Caveat: the plot will not be rescaled nor cleared (of course).
         * @param {CNum} z the complex number to add to the current plot
	 * @param {options} options change plot appearance (see {@link CNum.options} for a list of possible settings)
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

        /** add a CNum as a free vector to an existing plot - used to plot
	* several numbers on a single canvas. This method plots a CNum starting
	* at a point (x/y), for example to display sums of complex numbers.
        * Caveat: the plot will not be rescaled nor cleared (of course).
        * @param {CNum} z the complex number to add
        * @param {coordinate} x,y coordinates of the starting point
	* @param {options} 
	* change plot appearance (see {@link CNum.options} for a list of possible settings)
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
        /** Draw the complex number z as an arrow in the complex plane on the
	 * selected canvas (set by setCanvas()).
	 * This method either plots a single CNum or the first one in a series
	 * of CNums drawn onto the same canvas. Additional numbers can be
	 * displayed on that canvas using addToPlot
	 * @param {options} options change plot appearance (see {@link CNum.options} for a list of possible settings)
        * @param {optional number} radius scale the plot for a complex number of this value (default: autoscale)
         *@see setCanvas(): Set the canvas to draw on.
         *@see addToPlot(): draw another number into an existing plot.
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
