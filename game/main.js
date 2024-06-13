// main.js
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";

// Create a scene
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// variables
let player;
let mixer;

// Create a renderer and attach it to our document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const light = new THREE.AmbientLight(0xffffff, 1); // Ambient light to make sure everything is lit
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

//load scene environment here 
const loader = new GLTFLoader();
const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath('/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoloader);
loader.load('/last4.glb', function(glb){
    scene.add(glb.scene);
    glb.scene.position.set(0, 0, 0);
    glb.scene.scale.set(1, 1, 1);
}, function(xhr){
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error){
    console.error('An error happened', error);
});

loader.load('/Soldier.glb', function(glb){
    player = glb;
    scene.add(player.scene);
    player.scene.position.set(-2, -.2, -34);
    player.scene.scale.set(1, 1, 1);
    player.scene.rotation.y += 3;
    console.log(player.animations);
    mixer = new THREE.AnimationMixer(player.scene);
    const action = mixer.clipAction(player.animations[0]);
    action.play();
}, function(xhr){
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error){
    console.error('An error happened', error);
});


// creating orbit controls for mouse movement
const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true; // Enable smooth damping (inertia)
controls.dampingFactor = 0.25; // Set damping factor
controls.screenSpacePanning = false; // Disable panning
controls.maxPolarAngle = Math.PI / 2; // Restrict the vertical angle


// Move the camera away from the origin, down the positive z-axis
camera.position.z = -5;
camera.position.y = 10;
camera.position.x = -10;

// Create a function to animate our scene
function animate() {
    requestAnimationFrame(animate);

    //update controls
    controls.update();

    //mixer
    if(mixer) mixer.update();

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

// Run the animation function for the first time to kick things off
animate();
