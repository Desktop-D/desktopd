import * as THREE from "three";

const canvas = document.getElementById("environment");
const width = window.innerWidth;
const height = window.innerHeight;

// Set up the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    0.1,
    1000
);
camera.position.set(0, 0, 500);

// Create a 2D canvas for the renderer
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const light = new THREE.DirectionalLight( 0xffffff,1);
light.castShadow = true
light.position.set( 0, 0, 500 );
scene.add(light)

// Create a 3D model
const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);

// Add the model to the scene
cube.position.set(300, 0, 0)
scene.add(cube);

// Render the scene
renderer.setClearColor(0x000000, 0);
renderer.setSize(width, height);

renderer.render(scene, camera);

// function animate() {
//     requestAnimationFrame(animate);

//     const now = Date.now()

//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;

//     cube.position.x = Math.cos(now/1000) * 100 +  200
//     cube.position.y = Math.sin(now/1000) * 100

//     renderer.render(scene, camera);
// }
// animate();

window.addEventListener("mousemove", (e) => {
    cube.position.x = e.x - width/2
    cube.position.y = height/2 -e.y

    cube.lookAt(0,0,500)

    renderer.render(scene, camera);
})