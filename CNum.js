// M. Oettinger 03/2015, Marcus -at- oettinger-physics.de
//
/** @mainpage CNum.js: sketch the complex plane in a html5 canvas
 *  @author Marcus Oettinger
 *  @date 06.03.2015
 * @section CNum CNum.js
 * CNum.js is a javascript class to display a complex number in a gaussian plane
 * (this is sometimes called an Argand-Plot) on a html5-canvas and
 * do a quite limited set of calculations with an arbitrary complex number.
 * @subsection features Features
 * CNum is a javascript object holding the value of a complex number z (set by
 * a simple algebraic expression) that can be used to display the complex number
 * in different bases or to plot a vector-like diagram of z in the complex plane.
 * Graphics are drawn onto a html5 canvas - this should nowadays be supported 
 * by many browsers.
 *
 * I wrote the code because I needed a dynamic way to create an Argand diagram
 * in my pages for educational purposes. It serves a purpose and is far from
 * being cleanly written, nicely formatted or similar. If you like it, use it, If you don't
 * - guess what :-)
 * @subsection deps dependencies
 * CNum.js uses some external libraries:
 *
 * - jquery: 
 * - jcanvas: http://calebevans.me/projects/jcanvas/ (drawing routines)
 * - mathjs: http://mathjs.org (that can do much more!)
 * @subsection license License
 * MIT (see http://opensource.org/licenses/MIT or LICENSE.txt).
 *
 * @subsection constructor Constructor
 * Constructor for a CNum - the complex value is set via an algebraic expression.
 * usage: object = new CNum( expression ) creates a new complex number, e.g.
 *        z = new CNum("2+i");
 *
 * @param[in] expr
 * string representation of a complex number (parsed by mathjs, e.g. '2+3i', '12*exp(3i)')
*/
function CNum(expr) {
        // some reasonable defaults
        this._margin = 50;		// margin around the plot
        this.X_C = 100;			// center coordinates
        this.Y_C = 100;			//
        this.SCALE = 10.0;		//
        this._tickLength = 3;		//
        this._daCanvas = null;		// the canvas to use
        this.TICKSCALE = 0.001;

        zStr = math.eval( expr );
        this.zNum = math.complex(zStr);
        this.x = math.round(this.zNum.re, 3);
        this.y = math.round(this.zNum.im, 3);
        this.radius = this.zNum.toPolar().r;
        
        this.min = min;
        this.max = max;
        // return radius of the complex cartesian x+iy in gaussian plane
        // (pythagoras: r^2 = x^2 + y^2)
        this.getradius = function() { this.radius; }
        this.getXPos = getXPos;
        this.getYPos = getYPos;

        // html: different representations of z in C:
        this.ToCartesian = ToCartesian;
        this.ToCC = ToCC;
        this.ToR = ToR;
        this.ToTrigonometric = ToTrigonometric;
        this.ToPolar = ToPolar;

        this.drawticks = drawticks;
        this.axis = axis;
        this.circ = circ;
        this.drawz = drawz; 
        this.setCanvas = setCanvas;
        this.displayGauss = displayGauss;

        return this;
};

// return minimum in the sense of: b if b<a, a otherwise.
function min(a,b){ if (b<a){ return b; } return a; };

// return maximum in the sense of: b if b>a, a otherwise.
function max(a,b){ if (b>a){ return b; } return a; };

// Return complex number z in cartesian coordinates as html.
//
/** HTML of the complex number z in cartesian representation (e.g. '1+2i')
 *  @return a string containing a complex number
 */
function ToCartesian() {
        retval = this.x + " + " + this.y + "&middot; i";
        return retval;
};

// Return complex conjugate as html.
//
/** HTML of the complex conjugate z* in cartesian representation (e.g. '1-2i')
 *  @return a string containing a complex conjugate
 */
function ToCC() {
        retval = this.x + " - " + this.y + "&middot; i";
        return retval;
};

 
// Return norm as html.
//
/** HTML of the norm (length of the vector) of the complex number z (e.g. '2.236')
 *  @return a string containing a complex number
 */
function ToR() {
        retval = math.round(this.zNum.toPolar().r,3);
        return retval;
};

// Return complex number z in trigonometric representation as html.
//
/** HTML of the complex number z in trigonometric representation (e.g. '2.236(cos(1.107) + i &middot; sin(1.107))')
 *  @return a string containing a complex number in trigonometric rpresentation
 */
function ToTrigonometric() {
        rad = math.round(this.zNum.toPolar().r,3);
        phi = math.round(this.zNum.toPolar().phi,3);
        retval = rad + "&middot;(cos(" + phi + ") + i &middot;sin(" + phi +"))";
        return retval;
};

// Return complex number z in polar coordinates as html.
//
/** HTML of the complex number z in polar representation (e.g. '2.236 e<sup>i 1.107</sup>'')
 *  @return a string containing a complex number in polar coordinates
 */
function ToPolar() {
        rad = math.round(this.zNum.toPolar().r,3);
        phi = math.round(this.zNum.toPolar().phi,3);
        retval = rad + "&middot; e<sup>i " + phi + "</sup>";
        return retval;
};


// Graphics:
// -----------------------------------------------------------------------------
// calculate cartesian coordinates of a given point (x/y) on the canvas
function getXPos(x) { return this.x*this.SCALE + this.X_C; };
function getYPos(y) { return this.Y_C - this.y*this.SCALE; };

// draw a circle with radius |z|
function circ() {
        if (this._daCanvas == null) return;
        this._daCanvas.drawArc({
          draggable: false, strokeStyle: '#999', strokeWidth: 1, 
          x: this.X_C, y: this.Y_C, radius: (this.radius * this.SCALE)
        });
};

// drawticks(pos): draw ticks on x-and y-axis at position x = pos / y = pos
//
function drawticks(pos) {
        this._daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
                endArrow: false, x1: this.getXPos(pos) , y1: this.Y_C, x2: this.getXPos(pos), y2: this.Y_C + this._tickLength  });
        this._daCanvas.drawText({ strokeStyle: '#000', strokeWidth: 1,
                x: this.getXPos(pos), y: this.Y_C+10, fontSize: 10, fontFamily: 'serif',
                text: pos });
        this._daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
                endArrow: false, x1: this.X_C , y1: this.getYPos(pos), x2: this.X_C - this._tickLength , y2: this.getYPos(pos) });
        this._daCanvas.drawText({ strokeStyle: '#000', strokeWidth: 1,
                x: this.X_C-20, y: this.getYPos(pos)+3, fontSize: 10, fontFamily: 'serif',
                text: pos });
}; 


// draw axes for a cartesian coordinate system
//
function axis(){
       if (this._daCanvas == null) return;
       this._daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
               endArrow: true, arrowRadius: 10, arrowAngle: 90, 
               x1: this._margin, y1: this.Y_C, x2: this._plotW + this._margin , y2: this.Y_C });
       this._daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
               endArrow: true, arrowRadius: 10, arrowAngle: 90,
               x1: this.X_C, y1: this._plotH+this._margin,  x2: this.X_C, y2: this._margin });
};


// Define canvas to plot on    (this._initGaussianPlot = function( cnv ))
/** Set th canvas to plot on
 * @param[in] cnv (canvas object)
 * the canvas to use (conveniently selected via jquery).
 */
function setCanvas( cnv ) {
//        if (cnv.getContext("2d") != null) {
            this._daCanvas = cnv;
            this.X_C = cnv.width() / 2;
            this.Y_C = cnv.height() / 2;
            this._plotW = cnv.width() - 2 * this._margin;
            this._plotH = cnv.height() - 2 * this._margin;
            this.SCALE = min(this._plotW, this._plotH) / (2 * this.radius);

            while (this.radius/this.TICKSCALE > 10) {
                this.TICKSCALE = this.TICKSCALE*10; 
            }
            if (this.TICKSCALE >10) this.TICKSCALE = this.TICKSCALE*2;
//        }
};

// draw complex number z= x + iy in gaussian / argand plane.
// (polar representation of coordinates x/y in cartesian system)
//
function drawz() {
        for ( i=this.TICKSCALE; i<=this.radius; i+=this.TICKSCALE) {
            this.drawticks(i);
        }


        // calc xpos, ypos: point in gaussian plane
        xpos = this.getXPos();
        ypos = this.getYPos();
        // Draw arrow from center to P(xpos, ypos)
        this._daCanvas.drawLine({ strokeStyle: '#000', strokeWidth: 2, rounded: false,
                endArrow: true, arrowRadius: 10, arrowAngle: 90, 
                x1: this.X_C, y1: this.Y_C, x2: xpos, y2: ypos });
        this._daCanvas.drawLine({ strokeStyle: '#F00', strokeWidth: 1,
                x1: xpos, y1: this.Y_C, x2: xpos, y2: ypos });
        this._daCanvas.drawLine({ strokeStyle: '#F00', strokeWidth: 1,
                x1: this.X_C, y1: ypos, x2: xpos, y2: ypos });
        this._daCanvas.drawText({ strokeStyle: '#000', strokeWidth: 1,
                x: xpos+10, y: ypos-10, fontSize: 12, fontFamily: 'serif',
                text: 'z =' + this.x+ '+i'+ this.y });
};

// function display:
// * clear canvas and draw 
// 
/** Draw complex number z as an arrow in the complex plane on the canvas set by
@see setCanvas
* @param[in] clear (boolean)
* Clear canvas before displaying complex number if set to true
* @param[in] coords (boolean)
* draw a cartesian coordinate system if set to true
* @param[in] circle (boolean)
* Draw a circle with radius |z| (this is poor man's rotating pointer)
*/
function displayGauss(clear, coords, circle){
        this._daCanvas.clearCanvas();
        this.axis();
        this.drawz();
        this.circ();    
};

// -- CNum --