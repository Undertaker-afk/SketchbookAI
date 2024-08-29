globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

let loader = new GLTFLoader();

let playerModel = await loader.loadAsync('build/assets/boxman.glb');
let player = new Character(playerModel);
world.add(player);
playerModel.animations.forEach(a => {
    if (a.name === "Idle") a.name = CAnims.idle;
    if (a.name === "Run") a.name = CAnims.run;
});



document.addEventListener('keydown', (event) => {
    if (event.button === 0) { 
        
    }
});


extendMethod(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6)
});
player.takeControl();


let pistolModel = await loader.loadAsync("build/assets/pistol.glb");



console.log(pistolModel.scene.scale)

pistolModel.scene.position.copy({ "x": 0, "y": 14.86, "z": -1.93 });
world.graphicsWorld.add(pistolModel.scene);
//AutoScale({gltfScene:kitchen_knifeModel.scene, approximateScaleInMeters: .4});

/** @type {THREE.Object3D} */
let object = pistolModel.scene//.getObjectByName("Object_2");
object.position.set(0.1, -0.1, 0.1);
object.rotation.set(0, Math.PI / 2, 0);

const playerRightHand = player.getObjectByName("rhand");
playerRightHand.addWithPreservedScale(object);


expose(object);
world.startRenderAndUpdatePhysics?.();

extendMethod(world, "update", function (timeStep) {
    //world update here
});

