// Tue, 02 Aug 22 11:56:35 +0000
// M. Oettinger, Marcus -at- oettinger-physics.de
//
// v 0.6 - mathematical angle measurement (radians)
// v 0.5 - removed jquery and jcanvas dependency
//
/** 
 *  @file CNum.js: sketch the complex plane in a html5 canvas
 *  @author Marcus Oettinger <info@oettinger-phyiscs.de>
 *  @version 0.6
 *  @license MIT (see {@link http://opensource.org/licenses/MIT} or LICENSE).
 */
/**
 * @class CNum.js
 * is a javascript object plotting a representation of a number z in the complex
 * plane. The idea is to set a complex value by entering an algebraic
 * expression, transform it into different bases and draw a Gaussian plot
 * (aka Argand diagram).
 * Here's a [demo page]{@link https://MarcusOettinger.github.io/CNum.js/}.<br>
 * License: [the MIT License]{@link http://opensource.org/licenses/MIT}.<br>
 * <br>
 * Graphics are drawn onto a html5 canvas - this should nowadays
 * be supported  by most browsers.<br><br>
 * I wrote the code because I needed a dynamic plot of complex values in
 * webpages for a a basic maths lecture. It serves a purpose and is far from
 * being cleanly written, nicely formatted or similar.
 * 
 * <br><br>
 * CNum.js uses a single external library:
 * <ul>
 * <li>[mathjs]{@link http://mathjs.org} (that can do much more!)</li>
 * </ul>
 * Creates a CNum object - the complex value is set as an algebraic expression
 * in cartesian, trigonometric or polar form using i as the imaginary unit.
 * <br><br>
 * Usage is quite simple: object = new CNum( expr ) creates a new complex
 * number,<br>
 * e.g. <b><i> z = new CNum("2+i"); </i></b> &nbsp;&nbsp;
 * will create <b><i>z</i></b> with the value <b><i>2+i</i></b><br>.
 * @param {string} expr a text representing a complex number with imaginary unit i. Cartesian, trigonometric and polar expressions can be used, e.g. '2+3i' or '12*exp(3i)'
 * <br><br>
*/
function CNum( expr ) {
        // Private:
        // -----------------------------------------------------------------------------
        // paranoia mode: set some reasonable defaults
        var _margin = 50;		// margin around plot
        var X_C = 100, Y_C = 100;	// center coordinates
					// (will be overwritten by _setScale)
        var _plotW, _plotH;
        var _SCALE = 10.0;
        var _maxradius = 1;		// (remember the value the plot was autoscaled to)
        var _tickLength= 3;		//
        var _daCanvas = null;		// the canvas to use
        var _dactx = null;		// the canvas context

        var _TICKSCALE= 0.001;

        // default options - values can be set for every number displayed
	/**
	 * Options used to change the appearance of a plot. This set of options
	 * is used in all methods displaying numbers.
	 * @name options
	 * @memberOf CNum
	 * @function options
         * @param {Object} options
         * @param {boolean} options.clear - set to true to remove canvas contents before drawing
         * @param {boolean} options.coords - set to true to draw a coordinate system
	 * @param {boolean} options.Arrow draw <i><b>z</b></i> as an arrow - if set to false, draw a point. Defaults to true.
	 * @param {number}  options.arrowAngle angle to calculate arrowhead (dfault: 45)
	 * @param {number}  options.arrowRadius sets size of the arrowhead (default: 10)
	 * @param {boolean} options.circle draw a circle with radius <i><b>|z|</b></i>. Defaults to false.
	 * @param {boolean} options.ReIm show real and imaginary part in the plot. Default is true.
	 * @param {boolean} options.Ctext text to show at the position of the complex number. Set to false or null
	 * 	true to supress plotting any text, to true to display the value <i><b>z</b></i> in cartesian
	 *	notation or a string to be displayed. Defaults to true.
	 * @param {boolean} options.arc show angle and value as an arc. Default is true.
	 * @param {boolean} options.showDegree print angles in degrees instead of radians. Default is false.
	 * @param {boolean} options.ShowPiFractions print angles in multiples of the number π (if set to radians). Default is true.
	 * @param {number} options.decimals decimal places used in radius and angle values printed. Default is 1.
	 * @param {number} options.fontSize - font size in pixel, e.g. '10', '10px'
	 * @param {string} options.fontFamily - the font family (default: "sans-serif")
	 * @param {string} options.color set a color to use for arrow, text, angle. Defaults to '#888'.
	 * @param {number} options.linewidth width of drawn lines in px, defaults to 1.
	 */
        var _defaults = { 
            	// general plot options
            	clear: false, 		// clear canvas
            	coords: false, 		// draw coordinate system
            	// options for complex numbers
            	Arrow: true, 		// draw an arrow - if set to false, draw a point
            	arrowAngle: 45,
		arrowRadius: 10,
            	circle: false, 		// draw a circle with radius |z|
            	ReIm: true, 		// show real and imaginary part
            	Ctext: true,		// print z in cartesian notation
            	arc: true, 		// show angle and value as an arc
            	showDegree: false,	// show angles in degree (otherwise radians)
		showPiFractions: true,	// show angles in multiples of π (otherwise radians)
            	decimals: 2,		// decimal places used in radius and angle values
		fontSize: '12px', 
            	fontFamily: "serif",
            	// colors
            	color: "#888", 		// color to use for arrow, text, angle
            	linewidth: 1,		// guess what :-)
        };


        // math magic miracles...
        zStr = math.eval( expr );	// eval string expr to create an
					// expression mathjs can handle for sure...
        this.zNum = math.complex(zStr);	// ... and create a complex number
        this.x = math.round(this.zNum.re, 3); // store Re(z) and Im(z) for later
        this.y = math.round(this.zNum.im, 3);	//
        this.offsetx = 0;		// offset to move a vector out of (0/0)
        this.offsety = 0;		// - used for drawing sums
        var _radius = this.zNum.toPolar().r;	// find absolute value (radius)
        var _a = this.zNum.toPolar().phi;	// get angle phi - bummer:
        this.angle = _a<0 ? 2*Math.PI+_a : _a; 	// mathjs treats angles > PI as negative
					//  - great for calculations but
					// B*A*D if drawing polar plots...			
	this._daSettings = _defaults;	// Each CNum holds its own set of options
	var _numlist = [];		// a list of CNums to draw on the main canvas
	_count = 1;			// index the number of arrows on cnv - used to display
					// angles in a readable form

        // calculate cartesian coordinates of a given point (x/y) on the canvas
        function _XScaled(x) { return _SCALE * x; };
        function _YScaled(y) { return _SCALE * y; };
        function _XPos(x) { return X_C + _XScaled(x); };
        function _YPos(y) { return Y_C - _YScaled(y); };

	// return the sign of a number x (this ought to be fast and safe)
	function sign(x) { return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN; }

	// return minimum in the sense of: b if b<a, a otherwise.
	function min(a,b){ return b<a ? b : a ; }

	// return maximum in the sense of: b if b>a, a otherwise.
	function max(a,b){ return b>a ? b : a ; }

        // return the largest of the an arbitrary number of arguments
        function _getmaxRadius( ) {
        	var ret = _radius;
        	for (var i = 0; i < _numlist.length; i++) 
        		ret = max( ret, (_numlist[i].GetRadius()));
        	return ret;
        }
        
	// check if the string input ends with with substring search
	function endsWith(input, search) {
		var index = input.length - search.length;
		return index >= 0 && input.indexOf(search, index) > -1;
	}
	
	// format angle (given in radians) in radians, multiples of π or degree
	function _formatAngle(angle, showDegree, showPiFractions, decimals ) {
		return showDegree ? 
			(math.round((angle * 360)/ (2*Math.PI), decimals ) + '°') :
			showPiFractions ? math.round( angle/Math.PI, decimals ) + 'π' : math.round( angle, decimals ) ;
	}


	/**
	 *
	 * _setFont: set the font to use on the canvas context.
	 * @private
         * @param { ctx } the context
         * @param { options } {@link CNum.options ('fontSize' and 'fontFamily'
	 * can be used to define a font)
	 */
	function _setFont(ctx, params) {
		var str = params.fontSize;
		// convert size to the form 'XXpx'
		if (endsWith(str, 'px') == false) {
			while (isNaN(str) && str.length > 1) str = str.substring(0, str.length - 1);
			str = str + 'px';
		}
		ctx.font = str + ' ' + params['fontFamily'];
	}

        
	/**
	 *
	 * extend: mimick the jQuery.extend() function (merge the 
	 * contents of two or more objects together into the first 
	 * object).
	 * @private
	 * @param { options } target
	 * @param { options } [, object1 ] [, objectN ]
	 */
	function extend(){
		for(var i=1; i<arguments.length; i++)
			for(var key in arguments[i])
				if(arguments[i].hasOwnProperty(key))
					arguments[0][key] = arguments[i][key];
		return arguments[0];
	}
	
	
	// the drawing primitives used: line (with arrow heads if desired),
        // text, rectangle
        
        // clear the canvas
        /**
         * _clearCanvas(): clear the canvas
         * @private
         */
        function _clearCanvas() {
               	if ( _dactx == null ) return;
		_dactx.clearRect(0, 0, _daCanvas.width, _daCanvas.height);
		_count = 0;
        }
        
        // Adds an arrow head to a path using the given properties
	/**
	 * _addArrow(ctx, params, x1, y1, x2, y2) Adds an arrow head
	 * to a path using the given properties
	 * @private
	 * @param { numbers } x1, y1, x2, y2: coordinates of start and end
	 * point of the line to add an arrow head to.
	 */
	function _addArrow(ctx, params, x1, y1, x2, y2) {
		var leftX, leftY,
			rightX, rightY,
			offsetX, offsetY,
			atan2 = Math.atan2,
			PI = Math.PI,
			round = Math.round,
			abs = Math.abs,
			sin = Math.sin,
			cos = Math.cos,
			angle;

		// If arrow radius is given
		if (params.arrowRadius) {
			// Calculate angle
			angle = atan2((y2 - y1), (x2 - x1));
			// Adjust angle correctly
			angle -= PI;
			// Calculate offset to place arrow at edge of path
			offsetX = (params.linewidth* cos(angle))-1;
			offsetY = (params.linewidth* sin(angle))-1;

			// Calculate coordinates for left half of arrow
			leftX = x2 - (params.arrowRadius * cos(angle + (params.arrowAngle / 2)));
			leftY = y2 - (params.arrowRadius * sin(angle + (params.arrowAngle / 2)));
			// Calculate coordinates for right half of arrow
			rightX = x2 - (params.arrowRadius * cos(angle - (params.arrowAngle / 2)));
			rightY = y2 - (params.arrowRadius * sin(angle - (params.arrowAngle / 2)));

			// Draw left half of arrow
			ctx.moveTo(leftX - offsetX, leftY - offsetY);
			ctx.lineTo(x2 - offsetX, y2 - offsetY);
			// Draw right half of arrow
			ctx.lineTo(rightX - offsetX, rightY - offsetY);
			ctx.closePath();
			ctx.fill();

			// Visually connect arrow to path
			ctx.moveTo(x2 - offsetX, y2 - offsetY);
			ctx.lineTo(x2 + offsetX, y2 + offsetY);
			// Move back to end of path
			ctx.moveTo(x2, y2);
		}
	}


	/** 
	 * _drawLine( params, options ): draw a line on the canvas. Start and end point
	 * of the line are x1/y1 and x2/y2 in the array of settings.
	 * @private
	 * @param { params } options - CNum {@link options}
	 * @param { options } options - CNum {@link options}
	 * @example _drawLine({ color: 'red', linewidth: 2,
	 * x1: 1, y1: 1, x2: 10, y2: 10, endArrow: true })
	 */
        function _drawLine( params, options) {
        	if ( _dactx == null ) return;
		var settings= extend( {}, params, options);
		_dactx.strokeStyle = settings.color;
		_dactx.fillStyle = settings.color;
		_dactx.lineWidth = settings.linewidth;
		_dactx.beginPath();
	       	_dactx.moveTo(settings['x1'], settings['y1']);
	       	_dactx.lineTo(settings['x2'], settings['y2']);

		if (settings.endArrow)
			_addArrow(_dactx, settings, settings.x1, settings.y1, settings.x2, settings.y2);
		if (settings.startArrow)
			_addArrow(_dactx, settings, settings.x2, settings.y2, settings.x1, settings.y1);
			
		_dactx.stroke();
        }
        
       /** 
	 * _drawText( params, options ): draw text on the canvas at x/y (centered) using
       	 * the given options.
	 * @private
	 * @param { params } options - CNum {@link options}
	 * @param { options } options - CNum {@link options}
	 * @example _drawText({ color: 'red', x: 10, y: 20,
	 * fontSize: '24px', fontFamily: 'Arial', text: 'Hallo Welt' })
	 */
        function _drawText( params, options) {
		if ( _dactx == null ) return;
		var settings = extend( {}, params, options);
		_dactx.beginPath();
		_dactx.strokeStyle = settings.color;
		_dactx.lineWidth = settings.linewidth;
		_dactx.fillStyle = settings.color;
	       	_setFont(_dactx, settings);
	       	_dactx.textAlign = "center";
	       	_dactx.textBaseline = "middle";
	       	_dactx.fillText(settings.text, settings.x, settings.y);
	}
	       
	/** 
	 * _drawRect( options ): draw a rectangle on the canvas. 
	 * @private
	 * @param { options } options - CNum {@link options}
	 * @example _drawRect({ color: 'red', linewidth: 3,
	 * x: 10, y: 20, width: 30, height: 10 })
	 */
	function _drawRect( options ) {
		if ( _dactx == null ) return;
		var settings = extend( {}, this._daSettings, options);
		_dactx.beginPath();
		_dactx.strokeStyle = settings.color;
		_dactx.lineWidth = settings.linewidth;
		_dactx.rect(settings.x, settings.y, settings.width, settings.height);
		_dactx.stroke();
	}
	
	/**
	 * _drawArc: draw an arc on the canvas. 
	 * @private
	 * @param { CNum } z, complex number.
	 * @param { options } options - CNum {@link options}.
	 * @example _drawArc( znum, { color: 'red', linewidth: 3,
	 * x: 10, y: 20, radius:20, start: 0, end: 2*Math.PI })
	 */
	function _drawArc( z, options ) {
		if ( _dactx == null ) return;
		var settings = extend( {}, z.GetSettings(), options);
		var counterclockwise = true;

		_dactx.beginPath();
		_dactx.strokeStyle = settings.color;
		_dactx.lineWidth = settings.linewidth;
		_dactx.arc( settings.x, settings.y, settings.radius, settings.start, -settings.end, counterclockwise );
		_dactx.stroke();
	}
		
	/**
	 * _setScale: calculate a reasonable scale for the canvas to plot a complex number
	 * @private
	 * @param { number } maxradius: the radius of the number to display
	 */
        function _setScale(maxradius) {
                    X_C = _daCanvas.width / 2;
                    Y_C = _daCanvas.height / 2;
                    _plotW = _daCanvas.width - 2 * _margin;
                    _plotH = _daCanvas.height - 2 * _margin;
                    _SCALE = min(_plotW, _plotH) / (2 * maxradius);
                    _maxradius = maxradius;

                    while (maxradius/_TICKSCALE > 10) {
                       _TICKSCALE= _TICKSCALE*10; 
                    }
                    if (_TICKSCALE >10) _TICKSCALE= _TICKSCALE*2;
        } // _setScale


        /**
	 * _drawtick( pos ): draw a tick on x-and y-axis at position x = pos / y = pos
         * @private
         * @param { number } pos: tick position.
         */
        function _drawtick( settings, pos ) {
                _drawLine( settings, { x1: _XPos(pos) , y1: Y_C, 
                	x2: _XPos(pos), y2: Y_C + _tickLength });
                _drawText( settings, { x: _XPos(pos), y: Y_C+10, 
                        text: pos });
                _drawLine( settings, { x1: X_C , y1: _YPos(pos), 
                	x2: X_C - _tickLength, y2: _YPos(pos) });
                _drawText( settings, { x: X_C-20, y: _YPos(pos)+3,
                        text: pos });
        }; // _drawtick

        /** 
	 * _axes( settings): draw axes of a cartesian coordinate system
         * @private
         * @param { options } settings- CNum {@link options}.
         */
        function _axes( settings ){
               if (_daCanvas == null) return;
		var rec_w = _dactx.measureText("Re(z)").width + 10;
		var rec_h = parseInt(_dactx.font.match(/\d+/), 10);
               _drawLine( settings, { endArrow: true, x1: _margin, y1: Y_C,
		x2: _plotW + _margin , y2: Y_C });
		_drawText( settings, { x: _plotW + 2*_margin - rec_w/2 , y: Y_C, text: "Re(z)" });
		_drawText( settings, { x: X_C, y: _margin/2, text: "Im(z)" });
               _drawLine( settings, { endArrow: true, x1: X_C, y1: _plotH+_margin,
			x2: X_C, y2: _margin });
                for ( i=_TICKSCALE; i<=_maxradius; i+=_TICKSCALE) {
                    _drawtick( settings, i );
                }
        }; // _axes


        /** 
         * _drawReIm( z, x, y ): 
         * draw x/y, real and imaginary part using the given settings.
         * @private
	 * @param { CNum } z, the complex number to draw.
         * @param { coordinates } x/y the cartesian koordinates of the complex number.
         */
        function _drawReIm( z, x, y ) {
                xpos = _XPos( x );
                ypos = _YPos( y );
                // arrow is drawm from center to P(xpos, ypos)
                _drawLine( z.GetSettings(), { x1: xpos, y1: Y_C, x2: xpos, y2: ypos });
                _drawLine( z.GetSettings(), { x1: X_C, y1: ypos, x2: xpos, y2: ypos });
        }; // drawReIm



        /** 
         * drawz( z ): draw a complex number
         * z= x + iy into the gaussian / argand plane.
         * @private
         * @param { CNum } z, the complex number to draw. 
         */
        function drawz( z ) {
                // Draw arrow from A(z.xstart, z.ystart) to B(z.xpos, z.ypos)
                xpos = _XPos( z.x + z.offsetx );
                ypos = _YPos( z.y + z.offsety );
                x = _XScaled( z.offsetx );
                y = _YScaled( z.offsety );
                corr = z.offsetx>0?15:0;
		
		var settings = z.GetSettings();
                if ( settings.Arrow )
			_drawLine( settings, { endArrow: true,
                        	x1: X_C + x, y1: Y_C - y, x2: xpos, y2: ypos } );
                else
			_drawRect( { x: xpos-2, y: ypos-2, width: 4, height: 4 } );
		
		 
                if ( typeof(settings.Ctext) !== "undefined" && settings.Ctext !== false && settings.Ctext !== null) {
                	var tstr = "";
			if ( typeof( settings.Ctext) === "boolean" && settings.Ctext == true)
				tstr = 'z =' + math.complex(z.x, z.y).toString();
			else
				tstr = settings.Ctext;
			_drawText( settings, { x: xpos +10+corr, y: ypos-(sign(z.y)*10),
				text: tstr });
		}
        }; //drawz

        // _drawAngle: draw an angle of the arrow (mathematically starting from x-axis)
        /**
	 * _drawAngle( z, angle ): draw an angle at the base of the vector
	 * @private
 	 * @param { z } CNum defining the angle.
	 * @param { float } angle
	 */
        function _drawAngle( z, angle ) {
		var PI = Math.PI;
                if (_daCanvas == null) return;
                
		var ra = min(50, (this._radius * _SCALE)/2 );
		ra += _count * 2;
                _drawArc( z, { x: X_C, y: Y_C, radius: ra,
			start: 0, end: angle });
                tx = X_C + (ra-10)*math.cos(angle - PI/6);
                ty = Y_C - (ra-10)*math.sin(angle - PI/6);
                _drawText( z.GetSettings(), { x: tx,  y: ty,
                	text: _formatAngle( angle, z.GetSettings().showDegree, z.GetSettings().showPiFractions, z.GetSettings().decimals ) });
        }; // _drawAngle


        // draw a circle with radius |z| 
	// (e.g. to clarify the picture of rotating pointers in the complex plane)
	/**
	 * _circ( z ): draw a circle with center and radius on the canvas
	 * @private
	 * @param { z } CNum defining the radius of the circle.
	 */
        function _circ( z ) {
		var PI = Math.PI;
                if (_daCanvas == null) return;
                _drawArc( z , { x: X_C, y: Y_C, radius: (z.GetRadius() * _SCALE),
			start: 0, end: 2*PI });
        }; // _circ


        // =======================================================
        // Public methods:
        // =======================================================
        
        // return radius of the complex cartesian x+iy in gaussian plane
	/** 
	 * GetRadius(): return radius of the pointer (aka norm or absolute
	 * value of the complex number).
	 * @returns {float} radius of the complex number (norm)
	 */
        this.GetRadius = function() { return _radius;  };

	// return options array of the current CNum
	/** 
	 * GetSettings(): return current settings.
 	 * @returns { options } settings - {@link CNum.options}.
	 */
        this.GetSettings = function() { return this._daSettings; };
        
        // set options array of the current CNum
	/** 
	 * SetSettings(): change current settings
 	 * @param { options } settings - CNum {@link options}.
 	 * @returns { options } settings - current CNum {@link options}.
	 */
        this.SetSettings = function( newsettings ) {
        	var s = this.GetSettings();
        	this._daSettings = extend( {}, s, newsettings );
        	return this._daSettings;
        };

	// get the complex number z in cartesian coordinates as string
	// with a bit of html.
	/** 
	 * ToCartesian(): Return a string of the complex number z in cartesian representation (e.g. '1+2i')
         * @param { number } decimals: (optional) number of decimal places to round to (default: 1).
	 * @returns {string} a string containing the simplest form of the complex number <b><i>z = x + i&middot;y</i></b>
	 */
	this.ToCartesian = function() {
		var d = typeof decimals == 'undefined' ? this._daSettings.decimals : decimals;
                return this.zNum.format( d );
	};

	// get the complex conjugate of z.
	/** 
	 * ToCc(): return a string of the complex conjugate z* in cartesian representation (e.g. '1-2i')
         * @param { number } decimals: (optional) number of decimal places to round to (default: 1).
	 * @returns {string} <b><i>z&#773;</i></b>, a  string containing the complex conjugate of <b><i>z</i></b>.
	 */
	this.ToCC = function( decimals ) {
		var d = typeof decimals == 'undefined' ? this._daSettings.decimals : decimals;
		return  math.conj(this.zNum).format( d );
	};

 
        // Return the norm of the complex number z.
        /** 
         * ToR(): return a string of the norm (length of the vector) of the complex number z (e.g. '2.236')
         * @param { number } decimals: (optional) number of decimal places to round to (default: 1).
         * @returns {string} a string containing the norm as a real number.
         */
        this.ToR = function( decimals ) {
        	var d = typeof decimals == 'undefined' ? this._daSettings.decimals : decimals;
                return math.round(this.zNum.toPolar().r, d);
        };

        // get the complex number z in trigonometric form with some 
        // html formatting (for the multiplication).
        /** 
         * ToTrigonometric( decimals ): return a string of the complex number z in trigonometric representation (e.g. '2.236(cos(1.107) + i &middot; sin(1.107))')
         * @param { number } decimals: (optional) number of decimal places to round to (default: 1)
         * @returns {string} a string containing the complex number as a mathematical expression in trigonometric notation.
         */
        this.ToTrigonometric = function( decimals ) {
        	var d = typeof decimals == 'undefined' ? this._daSettings.decimals : decimals;
                var r = math.round( this.zNum.toPolar().r, d );
                var phi = this.zNum.toPolar().phi;
                phi = _formatAngle( phi, this._daSettings.showDegree, this._daSettings.showPiFractions, d );
                retval = r + "&middot;(cos(" + phi + ") + i &middot;sin(" + phi +"))";
                return retval;
        };

        // get the complex number z in polar coordinates with some 
        // html formatting (for the superscript in the exponential).
        /** 
         * ToPolar( decimals ): create a string of the complex number z in polar representation (e.g. '2.236 e<sup>i 1.107</sup>')
         * @param { number } decimals: (optional) number of decimal places to round to (default: 1)
         * @returns {string} a string containing the number <b><i>z</i></b> in polar coordinates with a bit of html for the superscripts.
         */
        this.ToPolar = function( decimals ) {
        	var d = typeof decimals == 'undefined' ? this._daSettings.decimals : decimals;
                var r = math.round( this.zNum.toPolar().r, d );
                var phi = this.zNum.toPolar().phi;
                phi = _formatAngle( phi, this._daSettings.showDegree, this._daSettings.showPiFractions, d );
                retval = r + "&middot; e<sup>i " + phi + "</sup>";
                return retval;
        };

        // the good stuff: Graphics
        // -----------------------------------------------------------------------------
        /**
         * setCanvas( cnv ): set the canvas to plot on
         * @param {integer} cnv the canvas to use
         * @returns { canvas } cnv 
         */
        this.setCanvas = function( cnv ) { 
        	_daCanvas = cnv;
        	_dactx = (cnv) ? cnv.getContext("2d") : null ;
        	return cnv;
        };

        /**
         * getXPos(): get cartesian coordinate x of a given point (x/y) on the canvas
         * @private
         * @returns { number } x
         */
        this.getXPos = function(x) { return _XPos(x); };
        /**
         * getYPos(): get cartesian coordinate y of a given point (x/y) on the canvas
         * @private
         * @returns { number } y
         */
        this.getYPos = function(y) { return _YPos(y); };


        // calculate the product of two complex numbers and add
        // numbers and result to an existing plot
	/** 
	 * multiplyCNum( z2, options, resultoptions ): multiply two complex numbers in a Gaussian plot.
	 * @param { CNum } z2 the number to multiply with
	 * @param { options } options set appearance of the complex number to multiply with (see {@link CNum.options})
	 * @param { options } resultoptions change appearance of the resulting complex number (see {@link CNum.options})
	 * @return { CNum } result of the operation as a CNum
	 */
        this.multiplyCNum =function( z2, options, resultoptions ){
		var settings = extend( {}, _defaults, options, { circle: false } );
		resultoptions = ( typeof resultoptions == 'undefined' ? settings : extend( {}, _defaults, resultoptions) );

		// calculate resulting value z = this * z2
		res = new CNum( math.multiply(this.zNum, z2.zNum).toString() );
		
		z2.offsetx = 0;
		z2.offsety = 0;
		this.addToPlot(z2, settings);		// multiplication of this and z2
		this.addToPlot(res, resultoptions);		// display the result
		// replot this and rescale to largest absolute value// replot this and rescale to largest absolute value
		this.displayGauss( this.GetSettings() );
		return res;
        }


        // calculate the sum of two complex numbers and add
        // numbers and result to an existing plot
	/** 
	 * addCNum ( _zToAdd, options, resultoptions ): add a CNum _zToAdd to the current CNum, plot the result and return the sum as a new CNum.
	 * @param { CNum } _zToAdd the number to add
	 * @param { options } options set appearance of the complex number to add (see {@link CNum.options} for a list of possible settings)
	 * @param { options } resultoptions change appearance of the resulting complex number (see {@link CNum.options} for a list of possible settings)
	 * @return { CNum } the result of the operation as a CNum
	 */
        this.addCNum =function(_zToAdd, options, resultoptions){
		var settings = extend( {}, _defaults, options, { circle: false, arc: false, ReIm: false } );
		resultoptions = ( typeof resultoptions == 'undefined' ? settings : extend( {}, _defaults, resultoptions) );

		// calculate resulting value z = this + _zToAdd
		// and add it to the plot
		res = new CNum( this.zNum.toString() + "+" + _zToAdd.zNum.toString() );
		this.addToPlot( res, resultoptions );

		_zToAdd.offsetx = this.x;
		_zToAdd.offsety = this.y;
		this.addToPlot( _zToAdd, settings );
            
		// replot this and rescale to largest absolute value
		this.displayGauss( this.GetSettings() );
		return res;
	}
        
        /**
         * _drawToPlot ( z ): draw a complex number to the plot
         * @private
         * @param { CNum } z the complex number to draw to the current plot
         */
        this._drawToPlot = function( z ) {
        	var s = z.GetSettings();
        	if (s.circle) _circ( z );
                if (s.arc) _drawAngle( z, z.angle );
                if (s.ReIm) _drawReIm( z, z.x, z.y );
                drawz( z );
	}

        /** 
         * addToPlot ( z, options ): add a CNum to an existing plot - may
	 * be used to plot several numbers on one canvas at the same time.
         * Caveat: the plot will not be rescaled nor cleared (of course).
         * @param { CNum } z the complex number to add to the current plot
	 * @param { options } settings change plot appearance (see {@link CNum.options} for a list of possible settings)
        */
        this.addToPlot = function( z, options ) {
        	var s = extend( {}, _defaults, options );
        	z.SetSettings( s );
		if ( z !== this) {
			_numlist.push( z );
		}
                this._drawToPlot( z );
        }; // addToPlot


        // * clear canvas and draw 
        // 
        /** 
         * displayGauss(options, radius): draw the complex number z as an arrow in the complex plane on the
	 * selected canvas (set by [setCanvas()]{@link CNum#setCanvas}).
	 * This method either plots a single CNum or the first one in a series
	 * of CNums drawn onto the same canvas. Additional numbers can be
	 * displayed on that canvas using [addToPlot()]{@link CNum#addToPlot}.
	 * @param {options} options change plot appearance (see {@link CNum.options} for a list of possible settings).
         * @param {number} radius (optional) scale the plot for a complex number of this value (default: autoscale).
         * @see [setCanvas()]{@link CNum#setCanvas}: Set the canvas to draw on.
         * @see [addToPlot()]{@link CNum#addToPlot}: draw another number into an existing plot.
        */
        this.displayGauss = function( options, radius ){
                // handle defaults
                var settings = extend( {}, _defaults, { clear:true, coords: true, circle: true }, options );
                var maxR = typeof radius == 'undefined' ? _getmaxRadius() : radius ;
                _setScale(maxR);
                _clearCanvas();
                _axes( settings );
		// plot this CNum...
                this.addToPlot(this, settings);
                // ...and all of the numbers added to the canvas
                for (var i = 0; i < _numlist.length; i++) {
/*                	_numlist[i]._count = i+1; */
                	this._drawToPlot( _numlist[i] );
                }       
        };

        // return a brandnew CNum :-)
        return this;
}; // -- CNum --
