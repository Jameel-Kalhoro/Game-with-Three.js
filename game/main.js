// main.js
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

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

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(outlinePass);

// Add lighting
const light = new THREE.AmbientLight(0xffffff, 1); // Ambient light to make sure everything is lit
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Load scene environment here
const loader = new GLTFLoader();
const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath('/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoloader);

loader.load('/untitled21.glb', function(glb) {
    scene.add(glb.scene);
    glb.scene.position.set(0, 0, 0);
    glb.scene.scale.set(1, 1, 1);
    
    // Create an array to store children to be removed
    glb.scene.traverse(function(child) {
        if (child.isMesh) {
            // Add children to objectsToCheck based on your condition
            if (!child.name.startsWith('_(Loose_En') && child.name !== 'G-Object060_1' && child.name !== 'wall-4' && child.name !== 'wall-44' && child.name !== 'wall-56' && child.name !== 'wall-51') {
                objectsToCheck.push(child);
            }            
        }
    });
    console.log("index of door "+findObjectIndexByName("DoorFrame002"));
}, function(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error) {
    console.error('An error happened', error);
});

//temporary array's item index finder
// Function to find index of object with name "DoorFrame002" in objectsToCheck
function findObjectIndexByName(name) {
    for (let i = 0; i < objectsToCheck.length; i++) {
        if (objectsToCheck[i].name === name) {
            return i;
        }
    }
    return -1; // Return -1 if object with specified name is not found
}

loader.load('/Soldier.glb', function(glb) {
    player = glb;
    scene.add(player.scene);
    player.scene.position.set(-2, 0, -26);
    player.scene.scale.set(.8, .8, .8);
    player.scene.rotation.y += 3;
    console.log(player.animations);
    mixer = new THREE.AnimationMixer(player.scene);
    action = mixer.clipAction(player.animations[0]);
    action.play();
}, function(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error) {
    console.error('An error happened', error);
});

// temporary code for setting objects
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(-2, 1.5, -34); // Set the initial target for the controls
// controls.update(); 

// Camera set to back of character
camera.position.set(-2, 1.5, -36.5);
camera.rotation.set(0, 3.1, 0);

// Track mouse movement
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

function updateCameraPosition() {
    if (!player) return;

    const radius = 2.5; // Distance from the player
    const angleX = mouseX * Math.PI; // Convert mouse position to angle

    const offsetX = radius * Math.sin(angleX + Math.PI);
    const offsetZ = radius * Math.cos(angleX + Math.PI);

    camera.position.set(
        player.scene.position.x + offsetX,
        player.scene.position.y + 1.5, // Keep the Y coordinate fixed
        player.scene.position.z + offsetZ
    );
    camera.lookAt(player.scene.position);
}

// Track key presses
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') keys.w = true;
    if (event.key === 'a') keys.a = true;
    if (event.key === 's') keys.s = true;
    if (event.key === 'd') keys.d = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w') keys.w = false;
    if (event.key === 'a') keys.a = false;
    if (event.key === 's') keys.s = false;
    if (event.key === 'd') keys.d = false;
});

// Function to check collision using Raycaster
const raycaster = new THREE.Raycaster();
const collisionThreshold = 1;

function checkCollision(direction) {
    if (!player) return false;

    const playerPosition = player.scene.position.clone();
    const directionVector = direction.clone().normalize();
    raycaster.set(playerPosition, directionVector);

    const intersects = raycaster.intersectObjects(objectsToCheck, true);

    if (intersects.length > 0 && intersects[0].distance < collisionThreshold) {
        console.log('Collision with object:', intersects[0].object);
        outlinePass.selectedObjects = [intersects[0].object];
        return true;
    }

    outlinePass.selectedObjects = [];
    return false;
}

// Update player position based on keyboard input and collision detection
function updatePlayerPosition() {
    if (!player) return;

    const speed = 0.04;
    const moveDirection = new THREE.Vector3(0, 0, 0);

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    if (keys.w) {
        const forwardDirection = cameraDirection.clone().multiplyScalar(speed);
        if (!checkCollision(forwardDirection)) {
            moveDirection.add(forwardDirection);
        }
    }
    if (keys.s) {
        const backwardDirection = cameraDirection.clone().multiplyScalar(-speed);
        if (!checkCollision(backwardDirection)) {
            moveDirection.add(backwardDirection);
        }
    }
    if (keys.a) {
        const leftDirection = new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x).normalize().multiplyScalar(speed);
        if (!checkCollision(leftDirection)) {
            moveDirection.add(leftDirection);
        }
    }
    if (keys.d) {
        const rightDirection = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x).normalize().multiplyScalar(speed);
        if (!checkCollision(rightDirection)) {
            moveDirection.add(rightDirection);
        }
    }

    if (moveDirection.lengthSq() > 0) {
        moveDirection.normalize();
    }

    player.scene.position.add(moveDirection.clone().multiplyScalar(speed));

    if (moveDirection.lengthSq() > 0) {
        const targetAngle = Math.atan2(-moveDirection.x, -moveDirection.z);
        player.scene.rotation.y = THREE.MathUtils.lerp(player.scene.rotation.y, targetAngle, 0.1);
    }

    if (moveDirection.lengthSq() > 0) {
        if (action !== mixer.clipAction(player.animations[3])) {
            mixer.stopAllAction();
            action = mixer.clipAction(player.animations[3]);
            action.play();
        }
    } else {
        if (action !== mixer.clipAction(player.animations[0])) {
            mixer.stopAllAction();
            action = mixer.clipAction(player.animations[0]);
            action.play();
        }
    }
}

// Animation loop function
function animate() {
    requestAnimationFrame(animate);

    updateCameraPosition();
    updatePlayerPosition();

    if (mixer) mixer.update(0.01);

    composer.render();
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});