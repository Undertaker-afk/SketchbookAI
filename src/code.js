(async function () {




    globalThis.world = new World();
    await world.initialize('build/assets/world.glb');

    GLTFLoader.prototype.loadAsync = async function (glbUrl) {
        return new Promise((resolve, reject) => {
            this.load(glbUrl, (gltf) => {
                AutoScale(gltf, 5);
                resolve(gltf);
            }, undefined, reject);
        });
    };



    globalThis.loader = new GLTFLoader();


    let playerModel = await loader.loadAsync('build/assets/boxman.glb');
    playerModel.animations.forEach(a => {
        if (a.name === "Idle") a.name = CAnims.idle;
        if (a.name === "Run") a.name = CAnims.run;
    });

    globalThis.player = new Character(playerModel);
    player.setPosition(-2.82, 14.8, -2.88);
    world.add(player);
    player.takeControl();
    
    let carModel = await loader.loadAsync('build/assets/car.glb');

        /**
     * Initializes a car with its model
     * @param {CarPrototype} car - The car object to initialize
     * @param {THREE.Object3D} carModel - The 3D model of the car
     * @returns {void}
     */
    carModel.initCar = function (car, carModel) {
        car.setPosition(-2.37, 14.86, -4.03);
    
        // Set up wheels
        car.wheels = [];
        const wheelPositions = [
            [0.53, -0.12, 0.86],
            [0.53, -0.12, -0.79],
            [-0.53, -0.12, 0.86],
            [-0.53, -0.12, -0.79]
        ];
    
        for (let i = 0; i < 4; i++) {
            const wheelObject = new THREE.Object3D();
            wheelObject.position.set(...wheelPositions[i]);
            car.add(wheelObject);
            car.wheels.push(new Wheel(wheelObject));
        }
    
        // Set wheel properties
        car.wheels[0].steering = true;
        car.wheels[0].drive = 'fwd';
        car.wheels[1].drive = 'rwd';
        car.wheels[2].steering = true;
        car.wheels[2].drive = 'fwd';
        car.wheels[3].drive = 'rwd';
    
        // Set up seats
        car.seats = [];
        const seatPositions = [
            [0.25, 0.06, 0.09],
            [-0.25, 0.06, 0.09],
            [0.25, 0.06, -0.45],
            [-0.25, 0.06, -0.45]
        ];
    
        // Set up entry points
        const entryPointPositions = [
            [1.00, -0.36, -0.03],
            [-1.00, -0.36, -0.03],
            [1.00, -0.36, -0.60],
            [-1.00, -0.36, -0.60]
        ];
    
        for (let i = 0; i < 4; i++) {
            const seatObject = new THREE.Object3D();
            seatObject.position.set(...seatPositions[i]);
            car.add(seatObject);
            
            const entryPoint = new THREE.Object3D();
            entryPoint.position.set(...entryPointPositions[i]);
            car.add(entryPoint);
            
            const seat = new VehicleSeat(car, seatObject, carModel);
            seat.entryPoints.push(entryPoint);
            car.seats.push(seat);
        }
    
        // Set up doors
        const doorPositions = [
            [0.57, 0.13, 0.21],
            [-0.57, 0.13, 0.21],
            [0.57, 0.13, -0.43],
            [-0.57, 0.13, -0.43]
        ];
    
        for (let i = 0; i < 4; i++) {
            const doorObject = new THREE.Object3D();
            doorObject.position.set(...doorPositions[i]);
            car.add(doorObject);
            car.seats[i].door = new VehicleDoor(car.seats[i], doorObject);
        }
    
        // Connect seats
        car.seats[0].connectedSeats = [car.seats[1]];
        car.seats[1].connectedSeats = [car.seats[0]];
        car.seats[2].connectedSeats = [car.seats[3]];
        car.seats[3].connectedSeats = [car.seats[2]];
        car.seats[0].type = SeatType.Driver;
        car.seats[1].type = SeatType.Passenger;
        car.seats[2].type = SeatType.Passenger;
        car.seats[3].type = SeatType.Passenger;
    
        // Set up camera
        car.camera = new THREE.Object3D();
        car.camera.position.set(0.24, 0.52, -0.01);
        car.add(car.camera);
    
        // Set up collision
        const bodyShape = new CANNON.Box(new CANNON.Vec3(0.64, 0.53, 1.245));
        bodyShape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
        car.collision.addShape(bodyShape, new CANNON.Vec3(0, 0.37, 0.04));
    
        const lowerBodyShape = new CANNON.Box(new CANNON.Vec3(0.61, 0.25, 1.21));
        car.collision.addShape(lowerBodyShape, new CANNON.Vec3(0, 0.09, 0.04));
    
        const cabinShape = new CANNON.Box(new CANNON.Vec3(0.54, 0.28, 0.535));
        car.collision.addShape(cabinShape, new CANNON.Vec3(0, 0.62, -0.26));
    
        const wheelShape = new CANNON.Cylinder(0.235, 0.235, 0.15, 32);
        for (let i = 0; i < 4; i++) {
            car.collision.addShape(wheelShape, new CANNON.Vec3(...wheelPositions[i]));
        }
    
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
    var car = new Car(carModel);
    world.add(car);
    car.setPosition(-2.37, 14.86, -4.03);
    
})();
