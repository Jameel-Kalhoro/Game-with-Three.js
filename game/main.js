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
let action;
const objectsToCheck = [];

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
    console.log(glb.scene.children[10].animations);
    scene.add(glb.scene);
    glb.scene.position.set(0, 0, 0);
    glb.scene.scale.set(1, 1, 1);
    glb.scene.traverse(function(child) {
        if (child.isMesh && !child.name.startsWith('_(Loose_En')) {
            objectsToCheck.push(child);
        }
    });
}, function(xhr){
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error){
    console.error('An error happened', error);
});

loader.load('/Soldier.glb', function(glb){
    player = glb;
    scene.add(player.scene);
    player.scene.position.set(-2, -.25, -34);
    player.scene.scale.set(1, 1, 1);
    player.scene.rotation.y += 3;
    console.log(player.animations);
    mixer = new THREE.AnimationMixer(player.scene);
    action = mixer.clipAction(player.animations[0]);
    action.play();
}, function(xhr){
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error){
    console.error('An error happened', error);
});

// camera set to back of character
camera.position.set(-2, 1.5, -36.5);
camera.rotation.set(0,3.1,);


// Track mouse movement
// let mouseX = 0;
// let mouseY = 0;
// document.addEventListener('mousemove', (event) => {
//     mouseX = (event.clientX / window.innerWidth) * 2 - 1;
//     mouseY = (event.clientY / window.innerHeight) * 2 - 1;
// });

// function updateCameraPosition() {
//     if (!player) return;

//     const radius = 2.5; // Distance from the player
//     const angleX = mouseX * Math.PI; // Convert mouse position to angle

//     const offsetX = radius * Math.sin(angleX + Math.PI);
//     const offsetZ = radius * Math.cos(angleX + Math.PI);

//     camera.position.set(
//         player.scene.position.x + offsetX,
//         player.scene.position.y + 1.5, // Keep the Y coordinate fixed
//         player.scene.position.z + offsetZ
//     );
//     camera.lookAt(player.scene.position);
// }

// // Track key presses
// const keys = {
//     w: false,
//     a: false,
//     s: false,
//     d: false
// };

// document.addEventListener('keydown', (event) => {
//     if (event.key === 'w') keys.w = true;
//     if (event.key === 'a') keys.a = true;
//     if (event.key === 's') keys.s = true;
//     if (event.key === 'd') keys.d = true;
// });

// document.addEventListener('keyup', (event) => {
//     if (event.key === 'w') keys.w = false;
//     if (event.key === 'a') keys.a = false;
//     if (event.key === 's') keys.s = false;
//     if (event.key === 'd') keys.d = false;
// });

// // Function to check collision in a specific direction
// function checkCollision(direction) {
//     if (!player) return false;

//     const playerBox = new THREE.Box3().setFromObject(player.scene);
//     playerBox.translate(direction);
//     playerBox.expandByScalar(-.1);

//     for (const object of objectsToCheck) {
//         const objectBox = new THREE.Box3().setFromObject(object);
//         objectBox.expandByScalar(-.1);
//         if (playerBox.intersectsBox(objectBox)) {
//             console.log('Collision with object:', object);
//             return true;
//         }
//     }

//     return false;
// }

// // Update character position and animation based on key presses
// function updatePlayerPosition() {
//     if (!player) return;

//     const speed = 0.04;
//     const moveDirection = new THREE.Vector3(0, 0, 0);

//     if (keys.w) {
//         const forwardDirection = new THREE.Vector3(0, 0, speed);
//         if (!checkCollision(forwardDirection)) {
//             moveDirection.z += 1;
//         }
//     }
//     if (keys.s) {
//         const backwardDirection = new THREE.Vector3(0, 0, -speed);
//         if (!checkCollision(backwardDirection)) {
//             moveDirection.z -= 1;
//         }
//     }
//     if (keys.a) {
//         const leftDirection = new THREE.Vector3(speed, 0, 0);
//         if (!checkCollision(leftDirection)) {
//             moveDirection.x += 1;
//         }
//     }
//     if (keys.d) {
//         const rightDirection = new THREE.Vector3(-speed, 0, 0);
//         if (!checkCollision(rightDirection)) {
//             moveDirection.x -= 1;
//         }
//     }

//     // Normalize move direction to avoid faster diagonal movement
//     if (moveDirection.lengthSq() > 0) {
//         moveDirection.normalize();
//     }

//     // Update player's position based on move direction and speed
//     player.scene.position.add(moveDirection.clone().multiplyScalar(speed));

//     // Update player's rotation to face the movement direction
//     if (moveDirection.lengthSq() > 0) {
//         const targetAngle = Math.atan2(-moveDirection.x, -moveDirection.z);
//         player.scene.rotation.y = THREE.MathUtils.lerp(player.scene.rotation.y, targetAngle, 0.1);
//     }

//     // Update animations based on movement
//     if (moveDirection.lengthSq() > 0) {
//         if (action !== mixer.clipAction(player.animations[3])) {
//             mixer.stopAllAction();
//             action = mixer.clipAction(player.animations[3]); 
//             action.play();
//         }
//     } else {
//         if (action !== mixer.clipAction(player.animations[0])) {
//             mixer.stopAllAction();
//             action = mixer.clipAction(player.animations[0]); 
//             action.play();
//         }
//     }
// }






// Create a function to animate our scene
function animate() {
    requestAnimationFrame(animate);


    // //update cameras position
    // updateCameraPosition();

    // //update player psoition
    // updatePlayerPosition();

    // // checkCollision();

    // //mixer
    // if(mixer) mixer.update(0.01);

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

// Run the animation function for the first time to kick things off
animate();


window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
});