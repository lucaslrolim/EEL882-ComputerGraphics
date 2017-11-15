var container, controls;
var camera, scene, renderer;

init();
animate();

var skeleton;

// arcball implementarion

var last_mx = 0;
var last_my = 0;
var cur_mx = 0;
var cur_my = 0;
var arcball_on = false;

var mouseIsPressed, mouseX, mouseY, pmouseX, pmouseY;
var buttonPressed;
var lastMousePoint;

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	/// Initial setting to camera, light, and scene ////

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 50;

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


	// Mouse Controls is an adaptation from Trackball controls that take care of zoom and translation

	controls = new THREE.MouseControls(camera);
	// document.addEventListener( 'mousedown', mousePressed, false );
	window.addEventListener('resize', resize, false);


	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;
	var setMouse = function () {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

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

function mousePressed() {
	buttonPressed = event.button
	if (buttonPressed == 0) {
		console.log('click');
		lastMousePoint = { "x": mouseX, "y": mouseY };
	}
}

function mouseMoved() {
	if (event.button == 0) {

	}
}

function mouseDragged() {
	if (buttonPressed == 0) {
		var v1 = get_arcball_vector(lastMousePoint.x, lastMousePoint.y);
		var v2 = get_arcball_vector(mouseX, mouseY);
		var angle = v1.angleTo(v2);
		var crossProduct = v1.cross(v2).normalize();
		var quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(crossProduct, angle);
		skeleton.applyQuaternion(quaternion);

		lastMousePoint = { "x": mouseX, "y": mouseY };
	}
}

function mouseReleased() {

}

function resize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);

}

/**
 * Get a normalized vector from the center of the virtual ball O to a
 * point P on the virtual ball surface, such that P is aligned on
 * screen's (X,Y) coordinates.  If (X,Y) is too far away from the
 * sphere, return the nearest point on the virtual ball surface.
 */

function get_arcball_vector(x, y) {
	//var P = new THREE.Vector3(1.0*x/window.innerWidth*2 - 1.0,1.0*y/window.innerHeight*2 - 1.0,0);
	// console.log(camera);

	var mousePos = new THREE.Vector3(x - window.innerWidth / 2, y - window.innerHeight / 2, 0);
	console.log(mousePos);
	console.log("----")
	console.log(camera.position);
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

