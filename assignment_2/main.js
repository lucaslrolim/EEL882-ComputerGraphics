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

	renderer.domElement.addEventListener ( 'dblclick', function () { 
        setMouse();
        mouseIsPressed = true; 
        if (typeof doubleClick !== 'undefined') doubleClick();

    });

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
var drawingPolygon; // draw a polygon line to orientate the user 

var objectSelected; // true if user select (click) in an object
var movingObject; // true if user is moving an object
var selectedPolygon; // user can select a polygon to move or rotate
var clickedPoint; // aplly this matrix when moving or rotating a polygon

var userDoubleclick;
var transformationMatrix;

var addNail;


function setup () {
	renderer.setClearColor (0xf6f6f6, 1);
	material = new THREE.LineBasicMaterial ( {color:0x23303c, depthWrite:false, linewidth : 1 } );
	startingLineDraw = true;
	drawingPoly = false;
	polyVertices = []
	polygons = []
	objectSelected = false;
	movingObject = false;
	userDoubleclick = false;
	addNail = true;
}

function mousePressed() {
	// check if user select (click in) some polygon
	for(var i = 0; i < polygons.length; i++){
		clickedPoint = {"x":mouseX,"y":mouseY};
		if(isInside(clickedPoint,getVertex(polygons[i].vertices))){
			objectSelected = true;
			selectedPolygon = polygons[i];
		}
	}


	// Set the first vertex of a polygon
	if(startingLineDraw && !objectSelected){
		var point = new THREE.Vector3 (mouseX,mouseY,0);
		var geometry = new THREE.Geometry();
		geometry.vertices.push (point);
		var line = new THREE.Line (geometry, material);
		scene.add (line);
		selected = line;
		startingLineDraw = false;
		var vertex = new THREE.Vector3 (mouseX,mouseY,0);
		polyVertices.push(vertex);
	}
	// Draw polygons
	if(!objectSelected){
		var line = selected;
		var point = new THREE.Vector3 (mouseX,mouseY,0);
		var oldgeometry = line.geometry;
		var newgeometry = new THREE.Geometry();
		newgeometry.vertices = oldgeometry.vertices;
		newgeometry.vertices.push (point);
		line.geometry = newgeometry;

		// if true we finish to draw the polygon
		if(endPoly({"x":mouseX,"y":mouseY})){
			startingLineDraw = true;

			var polyGeometry = new THREE.Geometry();

			// add all vertex of the polygon to the geometry
			for(i = 0; i < polyVertices.length; i++){
				polyGeometry.vertices.push(polyVertices[i]);
			}

			// Draw the polygon using shade

			var drawingPoly = new THREE.Line (polyGeometry, material);
			var shape = new THREE.Shape(drawingPoly.geometry.vertices);
			var extrudeSettings = { amount: 8, bevelEnabled: false, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
			var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			var material2 = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff , clipIntersection: true, } );
			var mesh = new THREE.Mesh(geometry, material2);

			scene.add(mesh);
			polygons.push(
				{
					"ThreePoly":mesh,
					"vertices":polyVertices.slice(1,), // remove duplicate of first vertex that we add before
					"childs":[],
					"nails":[]
				}
				);

			// remove the baselines of the polygon
			scene.remove(line);
			scene.remove(drawingLine);
			// clean the drawing polygon vertices information
			polyVertices = [];

		}
		// if the polygon are not finished yet
		else {
			var vertex = new THREE.Vector3 (mouseX,mouseY,0);
			polyVertices.push(vertex);
		}

	}

}

function mouseDragged() {

	// Operate over the polygon the user select
	// User can move the polygon around the screen
	if(objectSelected){
		var dif_x = mouseX-clickedPoint.x;
		var dif_y = mouseY-clickedPoint.y;
		clickedPoint.x = mouseX;
		clickedPoint.y = mouseY;
		transformationMatrix = new THREE.Matrix4();
		transformationMatrix.set(	1, 0, 0, dif_x,
				0, 1, 0, dif_y,
				0, 0, 1, 0,
				0, 0, 0, 1
		);
		selectedPolygon.ThreePoly.geometry.applyMatrix (transformationMatrix);
		for(var i = 0; i < selectedPolygon.vertices.length;i++){
			selectedPolygon.vertices[i].applyMatrix4(transformationMatrix);
		}
		selectedPolygon.ThreePoly.updateMatrix();

		// aplly to nails attached
		if(selectedPolygon.nails.length > 0){
			for(var i = 0;i < selectedPolygon.nails.length;i++){
				selectedPolygon.nails[i].geometry.applyMatrix (transformationMatrix);
			}
		}

		// apply the same transformation to childs
		apllyToChilds(selectedPolygon);



	}
	
}

function apllyToChilds(polygon){
		for (var i = 0; i < polygon.childs.length;i++){
			var childPolygon = polygon.childs[i];
			childPolygon.ThreePoly.geometry.applyMatrix (transformationMatrix);
			for(var j = 0; j < childPolygon.vertices.length;j++){
				childPolygon.vertices[j].applyMatrix4(transformationMatrix);
			}
			childPolygon.ThreePoly.updateMatrix();

			if(childPolygon.nails.length > 0){
				for(var k = 0;k < childPolygon.nails.length;k++){
					childPolygon.nails[k].geometry.applyMatrix (transformationMatrix);
				}
			}

			apllyToChilds(childPolygon);

		}
}




function mouseReleased() {
	// drop the object that the user selects
	objectSelected = false;
}

function mouseMoved (){
	if(polyVertices.length != 0 && !objectSelected){
		var initPoint = new THREE.Vector3 (polyVertices[polyVertices.length-1].x,polyVertices[polyVertices.length-1].y,0);
		var point = new THREE.Vector3 (mouseX,mouseY,0);
		var geometry = new THREE.Geometry();
		geometry.vertices.push (initPoint);
		geometry.vertices.push (point);
		scene.remove(drawingLine);
		drawingLine = new THREE.Line (geometry, material);
		scene.add (drawingLine);
	}
}

function doubleClick(){
	// clear things that mousePressed starts to do on the first click
	polyVertices = [];
	startingLineDraw = true;
	scene.remove(drawingLine);

	// add nail
	var radius   = 5;
	var segments = 64;
	var material = new THREE.MeshBasicMaterial( { color: 0xf1f8ff, side: THREE.DoubleSide } );
	var geometry = new THREE.CircleGeometry( radius, segments );
	var circle = new THREE.Mesh(geometry, material);
	circle.position.set( mouseX, mouseY, 0);
	// geometry.vertices.shift();
	
	scene.add(circle);


	// Detectet polygons in the point
	var clickedPolygons = []
	var polygonsIndex = []
	if(polygons.length > 0){
		clickedPoint = {"x":mouseX,"y":mouseY};
		for(var i = 0; i < polygons.length; i++){
			if(isInside(clickedPoint,getVertex(polygons[i].vertices))){
				clickedPolygons.push(polygons[i]);
				polygonsIndex.push(i);
			}
		}
		for (var i = 0; i < clickedPolygons.length; i++){
			var temp = clickedPolygons.slice(i+1,);
			for(var j = 0; j < temp.length;j++){
				polygons[polygonsIndex[i]].childs.push(temp[j]);
			}
			polygons[polygonsIndex[i]].childs = polygons[polygonsIndex[i]].childs.filter( onlyUnique );
			
		}
		clickedPolygons[0].nails.push(circle);	
	}
	console.log(polygons);
}

init();


//------------------------------------------------------------
//
// Utility Functions
//
//------------------------------------------------------------


// check if "close" a polygon with line draws
function endPoly(vertex){
	if(polyVertices.length < 3){
		return false;
	}
    var range = 15;
    var dist = range;
    var x_dif = vertex.x - polyVertices[0].x
    var y_dif = vertex.y - polyVertices[0].y
    var dist = Math.sqrt(Math.pow((x_dif),2)+Math.pow((y_dif),2));
    if(dist < range){
        return true;
    }
}

// check if user click inside a polygon
function isInside(point, polyVertices) {
    var inside = false;
    for (var i = 0, j = polyVertices.length - 1; i < polyVertices.length; j = i++) {
        var xi = polyVertices[i].x, yi = polyVertices[i].y;
        var xj = polyVertices[j].x, yj = polyVertices[j].y;

        var intersect = ((yi > point.y) != (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

        if (intersect){
        	inside = !inside;
        }
    }
    return inside;
};



function getVertex(polyVertices){
	var fixVertices = [];
	for(i = 0; i < polyVertices.length; i++){
		if(polyVertices[i].z ===0){
			fixVertices.push(polyVertices[i]);
		}
	}
	return fixVertices;
}


// return only unique values in an array
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}