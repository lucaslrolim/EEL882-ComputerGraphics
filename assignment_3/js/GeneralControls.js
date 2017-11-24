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

var sup_camera;

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


	// Mouse Controls is an adaptation from Trackball controls that take care of zoom and translation moving the camera

	//controls = new THREE.MouseControls(camera);

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
		m_x = (mouseX / window.innerWidth) * 2 - 1;
		m_y = - (mouseY/ window.innerHeight) * 2 + 1;

		var vector = new THREE.Vector3(m_x  , m_y , 0.5);
		vector.unproject( camera );
		var dir = vector.sub( camera.position ).normalize();
		var distance = - camera.position.z / dir.z;
		var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
		skeleton.position.x = pos.x;
		skeleton.position.y = pos.y;
	}
}

function mousewheel(event){
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
	//controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);

}


// UTILITY FUNCTIONS

// Get a normalized vector from the center of the virtual ball O to a point P on the virtual ball surface
function get_arcball_vector(x, y) {	
	var mousePos = new THREE.Vector3(x - window.innerWidth / 2, y - window.innerHeight / 2, 0);
	var cameraPos = new THREE.Vector3(camera.position.x, camera.position.y, -camera.position.z);
	var P = new THREE.Vector3();
	P.subVectors(mousePos, cameraPos);
	P.y = -P.y;
	var OP_squared = P.x * P.x + P.y * P.y;
	if (OP_squared <= 0.5 * 0.5) {
		P.z = Math.sqrt(0.5 * 0.5 - OP_squared);  // Pythagore
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

