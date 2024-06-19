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
// Specific small objects for bounding box collision detection
const smallObjects = ['C-skpfile-1', 'C-skpfile-2', 'C-skpfile-3', 'C-skpfile-4', 'C-skpfile-5'];

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

//adding planes
const planeGeometry = new THREE.PlaneGeometry(2, 4); // Adjust width and height as needed
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00, // Green color, adjust as needed
    transparent: true,
    opacity: 0 // Adjust opacity as needed (0.0 to 1.0)
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.position.set(-9, 0, -13.6); // Adjust position as needed
planeMesh.rotation.set(0,-5.2,0);
objectsToCheck.push(planeMesh);
scene.add(planeMesh);


const planeGeometry2 = new THREE.PlaneGeometry(1, 4); // Adjust width and height as needed
const planeMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x00ff00, // Green color, adjust as needed
    transparent: true,
    opacity: 0 // Adjust opacity as needed (0.0 to 1.0)
});
const planeMesh2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
planeMesh2.position.set(.5, 0, -14.5); // Adjust position as needed
planeMesh2.rotation.set(0,4.2,0);
objectsToCheck.push(planeMesh2);
scene.add(planeMesh2);



// Load scene environment here
const loader = new GLTFLoader();
const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath('/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoloader);

loader.load('/untitle11d.glb', function(glb) {
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
    console.log("index of door "+findObjectIndexByName("wall-23"));
    // scene.remove(objectsToCheck[52].name);
    console.log(objectsToCheck);
    removeObjectByName('wall-23');
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

function removeObjectByName(objectName) {
    const index = objectsToCheck.findIndex(obj => obj.name === objectName);
    if (index !== -1) {
        objectsToCheck.splice(index, 1);
        console.log(`Object '${objectName}' removed from objectsToCheck.`);
    } else {
        console.log(`Object '${objectName}' not found in objectsToCheck.`);
    }
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
    if (!player || !player.scene) return false;

    // Get the player's current position
    const playerPosition = player.scene.position.clone().add(direction);

    // Create a bounding box for the player
    const playerBox = new THREE.Box3().setFromObject(player.scene);
    playerBox.expandByScalar(-0.1); // Adjust for player's bounding box size

    // Check collision with all objects
    let collided = false;

    for (const object of objectsToCheck) {
        if (smallObjects.includes(object.name)) {
            // For small objects, use Box3 collision detection
            const objectBox = new THREE.Box3().setFromObject(object);
            if (playerBox.intersectsBox(objectBox)) {
                console.log('Collision with small object:', object);
                outlinePass.selectedObjects = [object];
                collided = true;
            }
        } else {
            // For other objects, use Raycaster collision detection
            const raycaster = new THREE.Raycaster();
            const directionVector = direction.clone().normalize();
            raycaster.set(playerPosition, directionVector);

            const intersects = raycaster.intersectObject(object, true);
            if (intersects.length > 0 && intersects[0].distance < collisionThreshold) {
                console.log('Collision with object:', intersects[0].object);
                // outlinePass.selectedObjects = [intersects[0].object];
                collided = true;
            }
        }

        if (collided) break; // Exit loop if collision detected
    }

    if (!collided) {
        outlinePass.selectedObjects = [];
    }

    return collided;
}


function updatePlayerPosition() {
    if (!player || !player.scene) return;

    const speed = 0.04;
    const moveDirection = new THREE.Vector3(0, 0, 0);

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    if (keys.w || keys.s || keys.a || keys.d) {
        if (keys.w) {
            moveDirection.copy(cameraDirection).multiplyScalar(speed);
        } else if (keys.s) {
            moveDirection.copy(cameraDirection).multiplyScalar(-speed);
        } else if (keys.a) {
            moveDirection.set(cameraDirection.z, 0, -cameraDirection.x).normalize().multiplyScalar(speed);
        } else if (keys.d) {
            moveDirection.set(-cameraDirection.z, 0, cameraDirection.x).normalize().multiplyScalar(speed);
        }

        // Check collision only if there is movement
        if (!checkCollision(moveDirection)) {
            player.scene.position.add(moveDirection);
        }

        // Rotate player to face movement direction
        const targetAngle = Math.atan2(-moveDirection.x, -moveDirection.z);
        player.scene.rotation.y = THREE.MathUtils.lerp(player.scene.rotation.y, targetAngle, 0.1);
    }

    // Play correct animation based on movement
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