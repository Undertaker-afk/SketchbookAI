const scene = new THREE.Scene();

const bodyGeometry = new THREE.BoxGeometry(1.28, 1.06, 2.49);
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.set(0.00, 0.37, 0.04);
scene.add(body);

const cubeGeometry = new THREE.BoxGeometry(1.22, 0.50, 2.42);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0.00, 0.09, 0.04);
scene.add(cube);

const cube2Geometry = new THREE.BoxGeometry(1.08, 0.56, 1.07);
const cube2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cube2 = new THREE.Mesh(cube2Geometry, cube2Material);
cube2.position.set(0.00, 0.62, -0.26);
scene.add(cube2);

const sphereGeometry = new THREE.SphereGeometry(0.305, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere1.position.set(0.31, 0.15, 0.94);
scene.add(sphere1);

const sphere2 = sphere1.clone();
sphere2.position.set(0.29, 0.65, 0.03);
scene.add(sphere2);

const sphere3 = sphere1.clone();
sphere3.position.set(-0.29, 0.65, 0.03);
scene.add(sphere3);

const sphere4 = sphere1.clone();
sphere4.position.set(0.29, 0.65, -0.54);
scene.add(sphere4);

const sphere5 = sphere1.clone();
sphere5.position.set(-0.29, 0.65, -0.54);
scene.add(sphere5);

const sphere6 = sphere1.clone();
sphere6.position.set(-0.31, 0.15, 0.94);
scene.add(sphere6);

const sphere7 = sphere1.clone();
sphere7.position.set(0.31, 0.15, -0.87);
scene.add(sphere7);

const sphere8 = sphere1.clone();
sphere8.position.set(-0.31, 0.15, -0.87);
scene.add(sphere8);

const sphere9 = sphere1.clone();
sphere9.position.set(0.31, 0.15, -0.27);
scene.add(sphere9);

const sphere10 = sphere1.clone();
sphere10.position.set(-0.31, 0.15, -0.27);
scene.add(sphere10);

const sphere11 = sphere1.clone();
sphere11.position.set(0.31, 0.15, 0.34);
scene.add(sphere11);

const sphere12 = sphere1.clone();
sphere12.position.set(-0.31, 0.15, 0.34);
scene.add(sphere12);

const wheelGeometry = new THREE.CylinderGeometry(0.235, 0.235, 0.15, 32);
const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheel1.position.set(0.53, -0.12, 0.86);
wheel1.rotation.x = Math.PI / 2;
scene.add(wheel1);

const wheel2 = wheel1.clone();
wheel2.position.set(0.53, -0.12, -0.79);
scene.add(wheel2);

const wheel3 = wheel1.clone();
wheel3.position.set(-0.53, -0.12, 0.86);
scene.add(wheel3);

const wheel4 = wheel1.clone();
wheel4.position.set(-0.53, -0.12, -0.79);
scene.add(wheel4);
