var container, controls;
var camera, scene, renderer;

init();
animate();

// This variable will store the object that we have in the scene
var skeleton;

// Mouse Variable controls
var mouseIsPressed, mouseX, mouseY, pmouseX, pmouseY;
var buttonPressed;
var clickedPoint;

// Variable to check if user wants to manipulate the scene or use the frames functionalities
var onCanvas = true;


function init() {
	// Space on the page that we will add the scene
	container = document.getElementById( 'canvas' );

	// Initial setting to camera, light, and scene 
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
	camera.position.z = 70;

	sup_camera = camera;

	scene = new THREE.Scene();
	scene.add(new THREE.HemisphereLight());

	var directionalLight = new THREE.DirectionalLight(0xffeedd);
	directionalLight.position.set(0, 0, 2);
	scene.add(directionalLight);

	// Loading object from .3ds model and adding it into the scene

	var loader = new THREE.TDSLoader();
	loader.load('models/skeleton.3ds', function (object) {
		skeleton = object;
		scene.add(object);

	});

	// Render settings

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// Fix the scene when resizing the browser
	window.addEventListener('resize', resize, false);

	// Mouse Listeners

	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;
	var setMouse = function () {
		mouseX = event.clientX;
		mouseY = event.clientY;
		
	}
	document.addEventListener( 'wheel', mousewheel, false );
	document.addEventListener('mousedown', function () {
		setMouse();
		mouseIsPressed = true;
		if (typeof mousePressed !== 'undefined') mousePressed();
	})

	document.addEventListener('mousemove', function () {
		pmouseX = mouseX;
		pmouseY = mouseY;
		setMouse();
		if (mouseIsPressed) {
			if (typeof mouseDragged !== 'undefined') mouseDragged();
		}
		if (typeof mouseMoved !== 'undefined') mouseMoved();
	});

	document.addEventListener('mouseup', function () {
		mouseIsPressed = false;
		if (typeof mouseReleased !== 'undefined') mouseReleased();
	});

}


// MOUSE FUNCTIONS

function mousePressed() {
	buttonPressed = event.button
	if (buttonPressed == 0 && onCanvas) {
		clickedPoint = { "x": mouseX, "y": mouseY };
	}
}

function mouseMoved() {
	if (event.button == 0) {
	}
}

function mouseDragged() {
	if (buttonPressed == 0 && onCanvas) {
		// Rotate the object using Arcball paradigm and Quaternions
		var v1 = get_arcball_vector(clickedPoint.x, clickedPoint.y);
		var v2 = get_arcball_vector(mouseX, mouseY);
		var angle = v1.angleTo(v2);
		var crossProduct = v1.cross(v2).normalize();
		var quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(crossProduct, angle);
		skeleton.applyQuaternion(quaternion);
		clickedPoint = { "x": mouseX, "y": mouseY };
	}
	if(buttonPressed == 2 && onCanvas){
		// translate the object
		m_x = (mouseX / window.innerWidth) * 2 - 1;
		m_y = - (mouseY/ window.innerHeight) * 2 + 1;
		var vector = new THREE.Vector3(m_x , m_y  , 0.5);
		vector.unproject(camera);
		var dir = vector.sub( camera.position );
		var distance = - (camera.position.z)/ dir.z;
		var pos = camera.position.clone().	add( dir.multiplyScalar(distance) );
		// These delta and signal are factors to help handle with the effects of objects` Z translation
		// and the divergences that in mouse coordinates 
		var delta = Math.abs(skeleton.position.z*distance*0.00008)
		var signal = 1;
		if(skeleton.position.z > 0){
			signal = -1;
		}
		// change object position
		skeleton.position.x = pos.x + pos.x * delta *signal;
		skeleton.position.y = pos.y + pos.y * delta*signal;

	}
}

function mousewheel(event){
	// Transtalte the object on Z axis
	if (event.deltaY < 0){
		skeleton.position.z += 5;
	}
	else {
		skeleton.position.z -= 5;
	}
}

function mouseReleased() {

}

// SCENE FUNCTIONS

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
	renderer.render(scene, camera);
	requestAnimationFrame(animate);

}


// UTILITY FUNCTIONS

// Get a normalized vector from the center of the virtual ball O to a point P on the virtual ball surface
function get_arcball_vector(x, y) {
	// Arcball implementation based on:
	// https://en.wikibooks.org/wiki/OpenGL_Programming/Modern_OpenGL_Tutorial_Arcball

	// Getting mouse position in screen cordenates
	var mousePos = new THREE.Vector3(x - window.innerWidth / 2, y - window.innerHeight / 2, 0);
	// Getting object position in screen coordenates
	var objectPos = new THREE.Vector3();
	objectPos.setFromMatrixPosition(skeleton.matrixWorld);
	objectPos.project(camera);
	objectPos.x *=  window.innerWidth / 2 ;
	objectPos.y *= - window.innerHeight / 2;

	var P = new THREE.Vector3();
	P.subVectors(mousePos, objectPos);
	P.y = -P.y;
	var OP_squared = P.x * P.x + P.y * P.y;
	var ballSize = skeleton.position.z * 0.5 + 70 * 2.5; // Adjust the ball size when user zoom in or zoom out the object
	if (OP_squared <= ballSize* ballSize) {
		P.z = Math.sqrt(ballSize * ballSize - OP_squared);  // Pythagore
	}
	else {
		P = P.normalize();
	}
	return P;
}


// Check if user click on the frame controls or on the scene

function settings() {
	onCanvas = false;
 }

function canvas() {
	onCanvas = true;
 }

