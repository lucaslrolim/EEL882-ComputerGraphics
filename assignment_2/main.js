//
// Global variables
//
var scene, width, height, camera, renderer;
var mouseIsPressed, mouseX, mouseY, pmouseX, pmouseY;

//
// Initialization of global objects and set up callbacks for mouse and resize
//
function init() {

	// Scene object
	scene = new THREE.Scene();

	// Will use the whole window for the webgl canvas
	width = window.innerWidth;
	height = window.innerHeight;

	// Orthogonal camera for 2D drawing
	camera = new THREE.OrthographicCamera( 0, width, 0, height, -height, height );
	camera.lookAt (new THREE.Vector3 (0,0,0));

	// Renderer will use a canvas taking the whole window
	renderer = new THREE.WebGLRenderer( {antialias: true});
	renderer.sortObjects = false;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );

	// Append camera to the page
	document.body.appendChild( renderer.domElement );

	// Set resize (reshape) callback
	window.addEventListener( 'resize', resize );

	// Set up mouse callbacks. 
	// Call mousePressed, mouseDragged and mouseReleased functions if defined.
	// Arrange for global mouse variables to be set before calling user callbacks.
	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;
	var setMouse = function () {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	renderer.domElement.addEventListener ( 'mousedown', function () {
		setMouse();
		mouseIsPressed = true; 
		if (typeof mousePressed !== 'undefined') mousePressed();
	});
	renderer.domElement.addEventListener ( 'mousemove', function () { 
		pmouseX = mouseX;
		pmouseY = mouseY;
		setMouse();
		if (mouseIsPressed) {
			if (typeof mouseDragged !== 'undefined') mouseDragged(); 
		}
		if (typeof mouseMoved !== 'undefined') mouseMoved();
	});
	renderer.domElement.addEventListener ( 'mouseup', function () { 
		mouseIsPressed = false; 
		if (typeof mouseReleased !== 'undefined') mouseReleased(); 
	});

	// If a setup function is defined, call it
	if (typeof setup !== 'undefined') setup();

	// First render
	render();
}

// 
// Reshape callback
//
function resize() {
	width = window.innerWidth;
	height = window.innerHeight;
	camera.right = width;
	camera.bottom = height;
	camera.updateProjectionMatrix();
	renderer.setSize(width,height);
	render();
}

//
// The render callback
//
function render () {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
	
};

//------------------------------------------------------------
//
// User code from here on 
//
//------------------------------------------------------------

var material; // A line material
var selected; // Object that was picked

var startingLineDraw; // check if a user is starting to draw a polygon
var polygons; // store the polygons objects
var startingPoint; // store the first vertex coordinates of the polygon being draw 
var polyVertices; // store all vertex of the polygon being draw  
var drawingLine; // draw a temporary line to orientate the user 

function setup () {
	renderer.setClearColor (0xf6f6f6, 1);
	material = new THREE.LineBasicMaterial ( {color:0x23303c, depthWrite:false, linewidth : 1 } );

	startingLineDraw = true;
	drawingPoly = false;
	polyVertices = []
	polygons = []
}

function mousePressed() {

	if(startingLineDraw){
		var point = new THREE.Vector3 (mouseX,mouseY,0);
		var geometry = new THREE.Geometry();
		geometry.vertices.push (point);
		var line = new THREE.Line (geometry, material);
		scene.add (line);
		selected = line;
		startingLineDraw = false;
		polyVertices.push({"x":mouseX,"y":mouseY})
	}
	else{
		var line = selected;
		var point = new THREE.Vector3 (mouseX,mouseY,0);
		var oldgeometry = line.geometry;
		var newgeometry = new THREE.Geometry();
		newgeometry.vertices = oldgeometry.vertices;
		newgeometry.vertices.push (point);
		line.geometry = newgeometry;

		if(endPoly({"x":mouseX,"y":mouseY})){
			startingLineDraw = true;
			polygons.push({"vertices":polyVertices});
			polyVertices = []
		}
		else {
			polyVertices.push({"x":mouseX,"y":mouseY})
		}

	}

}

function mouseDragged() {
	
}

function mouseReleased() {
}

function mouseMoved (){
	var initPoint = new THREE.Vector3 (polyVertices[polyVertices.length-1].x,polyVertices[polyVertices.length-1].y,0);
	var point = new THREE.Vector3 (mouseX,mouseY,0);
	var geometry = new THREE.Geometry();
	geometry.vertices.push (initPoint);
	geometry.vertices.push (point);
	scene.remove(drawingLine);
	drawingLine = new THREE.Line (geometry, material);
	scene.add (drawingLine);
}

init();


//------------------------------------------------------------
//
// Utility Functions
//
//------------------------------------------------------------

function endPoly(vertex){
    var range = 15;
    var dist = range;
    var x_dif = vertex.x - polyVertices[0].x
    var y_dif = vertex.y - polyVertices[0].y
    var dist = Math.sqrt(Math.pow((x_dif),2)+Math.pow((y_dif),2));
    if(dist < range){
        return true;
    }
}
