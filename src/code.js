(async function () {




    var world = globalThis.world = new World();
    await world.initialize('build/assets/world.glb');

    GLTFLoader.prototype.loadAsync = async function (glbUrl) {
        return new Promise((resolve, reject) => {
            this.load(glbUrl, (gltf) => {                
                resolve(gltf);
            }, undefined, reject);
        });
    };



    globalThis.loader = new GLTFLoader();

/* playerModel hierarchy:

Scene (0.00, 0.00, 0.00) Center: (0.00, 15.50, 0.01) Size: (0.18, 0.39, 0.12)
  Armature (0.00, 0.00, 0.00) Center: (0.00, 15.50, 0.01) Size: (0.18, 0.39, 0.12)
    root (0.00, 0.00, 0.00)
      butt_bone (0.00, 0.95, -0.00)
        body_IK (0.01, -0.01, 0.04)
          arm_upperL (0.52, 0.00, 0.87)
            arm_lowerL (0.00, 0.44, -0.00)
          body_lower (-0.00, -0.00, 0.00)
            body_upper (0.00, 0.49, -0.00)
              head (-0.00, 0.58, 0.00)
          arm_upperR (-0.52, 0.00, 0.87)
            arm_lowerR (-0.00, 0.44, 0.00)
          leg_upperR (-0.18, 0.00, -0.05)
            leg_lowerR (0.00, 0.44, 0.00)
          leg_upperL (0.18, 0.00, -0.05)
            leg_lowerL (-0.00, 0.44, -0.00)
    game_man (0.00, 0.00, 0.00) Center: (0.00, 15.50, 0.01) Size: (0.18, 0.39, 0.12)
*/
    let playerModel = await loader.loadAsync('build/assets/boxman.glb');
    playerModel.animations.forEach(a => {
        if (a.name === "Idle") a.name = CAnims.idle;
        if (a.name === "Run") a.name = CAnims.run;
    });
    //CRITICAL: Uncomment and assign rhand and lhand to player model, use playerModel hierarchy
    //player.lhand = playerModel.scene.getObjectByName( 
    //player.rhand = 

    var player = globalThis.player = new Character(playerModel);
    AutoScale({ gltf: playerModel, approximateScaleInMeters: 2 });
    world.add(player);
    player.takeControl();


/*    let teslaModel = await loader.loadAsync('build/assets/tesla.glb');
    let tesla = CreateCar(teslaModel);
    tesla.setPosition(-2.83, 14.86, -4.1);
*/

/*
    var HorseModel = globalThis.HorseModel = await loader.loadAsync("Horse.glb");
    HorseModel.scene.position.copy({ "x": -1.66, "y": 14.8, "z": -2.81 });
    world.graphicsWorld.add(HorseModel.scene);
    AutoScale({gltf:HorseModel, approximateScaleInMeters: 3});
    const horseCollider = new TrimeshCollider(HorseModel.scene, {
        position: HorseModel.scene.position,
        rotation: HorseModel.scene.quaternion
    });
    world.physicsWorld.add(horseCollider.body);
    */

    /*
    let horse = await loadModelWithPhysics({ glbUrl: "Horse.glb",mass: 1 });
    horse.setPosition({ "x": -1.66, "y": 14.8, "z": -2.81 });
*/


    
/* kitchen_knifeModel hierarchy:

Sketchfab_Scene (0.00, 0.00, 0.00) Center: (18.91, 1.06, 0.65) Size: (239.95, 39.87, 13.85)
  Sketchfab_model (0.00, 0.00, 0.00) Center: (18.91, 1.06, 0.65) Size: (239.95, 39.87, 13.85)
    288b6503a75b430e8b0374093cd36649objcleanermaterialmergergles (0.00, 0.00, 0.00) Center: (18.91, 1.06, 0.65) Size: (239.95, 39.87, 13.85)
      Object_2 (0.00, 0.00, 0.00) Center: (18.91, 1.06, 0.65) Size: (239.95, 39.87, 13.85)
*/
var kitchen_knifeModel = globalThis.kitchen_knifeModel = await new Promise((resolve, reject) => { 
    new GLTFLoader().load("kitchen_knife.glb", 
        gltf => {

            
            resolve(gltf);
        });
});
//CRITICAL: Uncomment and assign correct scale immediately!
AutoScale({gltf:kitchen_knifeModel, approximateScaleInMeters: .2});

kitchen_knifeModel.scene.position.copy({"x":-2.57,"y":14.8,"z":-1.66});
world.graphicsWorld.add(kitchen_knifeModel.scene);
/*
var kitchen_knifeModel = globalThis.kitchen_knifeModel = new TrimeshCollider(kitchen_knifeModel.scene, {
        position: kitchen_knifeModel.scene.position,
        rotation: kitchen_knifeModel.scene.quaternion
    });
world.physicsWorld.add(kitchen_knifeModel.body);
*/

})();
