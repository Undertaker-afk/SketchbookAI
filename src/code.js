globalThis.world = new World('build/assets/world.glb');
const model = await new Promise((resolve, reject) => { world.loadingManager.loadGLTF('build/assets/boxman.glb', resolve, undefined, reject); });
globalThis.player = new Character(model);
let worldPos = new THREE.Vector3();
player.setPosition(worldPos.x, worldPos.y, worldPos.z);
world.add(player);
player.takeControl();
