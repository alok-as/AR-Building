// DOM Selections
const stage = document.querySelector(".stage");

let scene,
	camera,
	renderer,
	geometry,
	material,
	texture,
	cube,
	controls,
	loader,
	model,
	cushion,
	carpet,
	group,
	selectedOption = "legs";

let onRenderFcts = [];

//Importing the 3d model
const modelPath = "./images/building 2.obj";

//Setting up inital Texture and Material
const initialTexture = new THREE.TextureLoader().load(
	"https://images.pexels.com/photos/845234/pexels-photo-845234.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
);
const initialMaterial = new THREE.MeshBasicMaterial({ map: initialTexture });

const buildingLoader = () => {
	loader = new THREE.OBJLoader();
	loader.load(
		modelPath,
		(obj) => {
			obj.scale.set(0.07, 0.07, 0.07);
			obj.rotation.x = Math.PI / 2;
			obj.position.set(0, 0, -1);

			obj.traverse((piece) => {
				if (piece.material) {
					piece.material = initialMaterial;
				}
			});
			scene.add(obj);
		},
		undefined,
		(error) => {
			console.error(error);
		}
	);
};

const init = () => {
	//Creating a scene
	scene = new THREE.Scene();

	//Setting up the camera
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		2000
	);
	camera.position.y = 1000;
	camera.lookAt(scene.position);

	scene.add(camera);

	var arToolkitSource = new THREEx.ArToolkitSource({
		sourceType: "webcam",
	});

	arToolkitSource.init(function onReady() {
		setTimeout(() => {
			onResize();
		}, 2000);
	});

	// handle resize
	window.addEventListener("resize", function () {
		onResize();
	});

	function onResize() {
		arToolkitSource.onResizeElement();
		arToolkitSource.copyElementSizeTo(renderer.domElement);
		if (arToolkitContext.arController !== null) {
			arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
		}
	}

	// create atToolkitContext
	var arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl:
			THREEx.ArToolkitContext.baseURL + "./data/camera_para.dat",
		detectionMode: "mono",
	});
	// initialize it
	arToolkitContext.init(function onCompleted() {
		camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
	});

	// update artoolkit on every frame
	onRenderFcts.push(function () {
		if (arToolkitSource.ready === false) return;

		arToolkitContext.update(arToolkitSource.domElement);

		// update scene.visible if the marker is seen
		scene.visible = camera.visible;
	});

	// init controls for camera
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
		type: "pattern",
		patternUrl: "./data/patt.hiro",
		changeMatrixMode: "cameraTransformMatrix",
	});

	// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
	scene.visible = false;

	//Rendering the scene and camera
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	//Adding the Oribit Controls
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.update();

	onRenderFcts.push(function () {
		renderer.render(scene, camera);
	});

	//Creating a New Group
	// group = new THREE.Group();

	//Adding a new 3D Model
	// bedLoader();
	buildingLoader();
};

// run the rendering loop
var lastTimeMsec = null;

//Making Scene responsive
// window.addEventListener("resize", () => {
// 	camera.aspect = stage.offsetWidth / stage.offsetHeight;
// 	renderer.setSize(stage.offsetWidth, stage.offsetHeight);
// 	camera.updateProjectionMatrix();
// });

init();
requestAnimationFrame(function animate(nowMsec) {
	// keep looping
	requestAnimationFrame(animate);
	// measure time
	lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
	var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
	lastTimeMsec = nowMsec;
	// call each update function
	onRenderFcts.forEach(function (onRenderFct) {
		onRenderFct(deltaMsec / 1000, nowMsec / 1000);
	});
});
