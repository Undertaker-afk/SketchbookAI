

globalThis.world = new World('build/assets/world.glb');
await world.initialize();

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            AutoScale(gltf, 5);
            resolve(gltf);
        }, undefined, reject);
    });
};



let loader = new GLTFLoader();


let playerModel = await loader.loadAsync('build/assets/boxman.glb');
playerModel.animations.forEach(a => {
    if (a.name === "Idle") a.name = CAnims.idle;
    if (a.name === "Run") a.name = CAnims.run;
});

let player = new Character(playerModel);
player.setPosition(-2.82, 14.8, -2.88);
world.add(player);
player.takeControl();

let carModel = await loader.loadAsync('build/assets/car.glb');

/*
- vehicle
  - seats
    - seat_1
    - seat_3
    - seat_2
    - seat_4
  - entrances
    - entrance_1
    - entrance_3
    - entrance_4
    - entrance_2
  - objects
    - Empty
    - Cube006
    - Cube002
    - Sphere
    - Sphere001
    - Sphere002
    - Sphere004
    - Sphere007
    - Sphere003
    - Sphere005
    - Sphere006
    - Sphere008
    - Sphere009
    - Sphere010
    - Sphere011
  - body
    - Steer_parent
      - Steering_wheel
    - door_1
    - door_2
    - door_3
    - door_4
  - wheels
    - wheel_fl
    - Cylinder001
    - wheel_fr
    - wheel
*/

/* CRITICAL: Uncomment and assign correct objects to seats and wheels immediately!
carModel.initCar = function (car,carModel) {
    
    car.setPosition(-2.37, 14.86, -4.03);

    // Set up seats
    car.seats = [
        new VehicleSeat(car, carModel.scene., carModel),
        new VehicleSeat(car, carModel.scene., carModel),
        new VehicleSeat(car, carModel.scene., carModel),
        new VehicleSeat(car, carModel.scene., carModel)
    ];

    // Connect seats
    car.seats[0].connectedSeats = [car.seats[1]];
    car.seats[1].connectedSeats = [car.seats[0]];
    car.seats[2].connectedSeats = [car.seats[3]];
    car.seats[3].connectedSeats = [car.seats[2]];

    // Set up wheels
    car.wheels = [
        new Wheel(carModel.scene.),
        new Wheel(carModel.scene.),
        new Wheel(carModel.scene.),
        new Wheel(carModel.scene.),
    ];

    // Set wheel properties
    car.wheels[0].steering = true;
    car.wheels[0].drive = 'fwd';
    car.wheels[1].steering = true;
    car.wheels[1].drive = 'fwd';
    car.wheels[2].drive = 'rwd';
    car.wheels[3].drive = 'rwd';

    // Set up camera
    car.camera = car.getObjectByName('Empty');

    // Set up collision
    const bodyShape = new CANNON.Box(new CANNON.Vec3(.5, 0.2, 1));
    bodyShape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
    car.collision.addShape(bodyShape);

    const sphereShape = new CANNON.Sphere(0.5);
    sphereShape.collisionFilterGroup = CollisionGroups.TrimeshColliders;
    car.collision.addShape(sphereShape, new CANNON.Vec3(0, 0, 1.5));

    // Set up materials
    car.traverse((child) => {
        if (child.isMesh) {
            Utils.setupMeshProperties(child);

            if (child.material !== undefined) {
                car.materials.push(child.material);
            }
        }
    });
}
*/
let car = new Car(carModel);

car.setPosition(-2.37, 14.86, -4.03);
world.add(car);

