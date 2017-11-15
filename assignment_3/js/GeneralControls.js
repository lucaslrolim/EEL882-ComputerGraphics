var container, controls;
var camera, scene, renderer;

init();
animate();

var skeleton;
var clickedPoint;
function init() {

	container = document.createElement( 'div' );
	document.body.appendChild(container);

	/// Initial setting to camera, light, and scene ////

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 50;

	scene = new THREE.Scene();
	scene.add( new THREE.HemisphereLight() );

	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 2 );
	scene.add(directionalLight);

	// Loading object from .3ds model and adding it into the scene

	var loader = new THREE.TDSLoader();
	loader.load( 'models/skeleton.3ds', function ( object ) {
		skeleton = object;
		scene.add( object );

	});
	
	// Render settings

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	// Mouse Controls is an adaptation from Trackball controls that take care of zoom and translation

	controls = new THREE.MouseControls(camera);
	
	window.addEventListener( 'resize', resize, false );
}


function resize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
	controls.update();
	renderer.render( scene, camera );
	requestAnimationFrame( animate );

}
