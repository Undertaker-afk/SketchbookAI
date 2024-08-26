(async () => {
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
    if (!globalThis.player) {
        globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb');
        globalThis.player = new Character(playerModel);
        world.add(player);
        playerModel.animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });        
    }

    
    player.takeControl();

    
    var kitchen_knifeModel = globalThis.kitchen_knifeModel = await new Promise((resolve, reject) => { 
        new GLTFLoader().load("kitchen_knife.glb", 
            gltf => {
                resolve(gltf);
            });
    });
    let scene = kitchen_knifeModel.scene
    AutoScale({gltfScene:scene, approximateScaleInMeters: .2});
    scene.position.copy({"x":0,"y":14.86,"z":-1.93});
    world.graphicsWorld.add(scene);
    let scene2 = {...kitchen_knifeModel, scene:kitchen_knifeModel.scene.clone()};

    scene2.scene.position.copy({"x":0,"y":15.86,"z":-1.93});
    world.graphicsWorld.add(scene2.scene);


    
    var Soldier4Model = globalThis.Soldier4Model = await new Promise((resolve, reject) => { 
        new GLTFLoader().load("Soldier (4).glb", 
            gltf => {
    
            
                
                resolve(gltf);
            });
    });
    
    
    var Soldier4 = globalThis.Soldier4 = Soldier4Model.scene.clone();
    Soldier4.position.set(5.71, 14.80, -11.42);
    world.add(Soldier4);
    
})();