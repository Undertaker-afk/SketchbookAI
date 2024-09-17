export {};









// #region Global Variables
const world = new World();
let player: Player;
// #endregion
// #region Initialization
initialize();
async function initialize() {
    await world.initialize('build/assets/world.glb');
    // #region Player Setup
    const playerModel = await loadAsync('build/assets/boxman.glb');
    expose(playerModel.scene, "player");
    AutoScale(playerModel.scene, 1.7);
    player = new Player(playerModel);
    expose(player.moveSpeed, "player speed");
    player.setPosition(0, 0, -5);
    world.add(player);
    player.takeControl();
    // #endregion Player Setup

    // #region  Car Setup
    let acarModel = await new GLTFLoader().loadAsync("build/assets/car2.glb");
    AutoScale(acarModel.scene, 5);
    let acar = new ExtendedCar(acarModel);
    world.add(acar);
    acar.setPosition(0.57, -0.53, -3.45);
    // #endregion Car Setup

    // #region Rocket Launcher Setup
    const rocketLauncherModel = await loadAsync('build/assets/rocketlauncher.glb');
    AutoScale(rocketLauncherModel.scene, 0.5);
    const rocketLauncher = new RocketLauncher(rocketLauncherModel.scene);
    // Add rocket launcher to car rooftop
    rocketLauncher.position.set(0, 0.9, 0.1); // Adjust position on rooftop 
    acar.add(rocketLauncher);
    acar.rocketLauncher = rocketLauncher; // Assign rocket launcher to the car
    // #endregion Rocket Launcher Setup
}
// #endregion

class ExtendedCar extends Car {
    public rocketLauncher: RocketLauncher | null = null;

    constructor(gltf: GLTF) {
        super(gltf);
        this.actions.shoot = new KeyBinding("mouse1", "Shoot");
    }

    public override readVehicleData(gltf: GLTF): boolean {
        this.initCar(gltf.scene, 0);
        return true;
    }

    private initCar(carModel: THREE.Group, h: number = 0.45): void {
        // Set up wheels from car2 model
        this.wheels = [];
        const wheelPositions = [
            [0.53, -0.12 + h, 0.86],
            [0.53, -0.12 + h, -0.79],
            [-0.53, -0.12 + h, 0.86],
            [-0.53, -0.12 + h, -0.79]
        ] as const;

        const wheelObjects = [
            carModel.getObjectByName("wheel_fl") as THREE.Object3D,
            carModel.getObjectByName("wheel_rl") as THREE.Object3D,
            carModel.getObjectByName("wheel_fr") as THREE.Object3D,
            carModel.getObjectByName("wheel_rr") as THREE.Object3D
        ];

        for (let i = 0; i < 4; i++) {
            const wheelObject = wheelObjects[i];
            wheelObject.position.set(...wheelPositions[i]);
            this.add(wheelObject);
            this.wheels.push(new Wheel(wheelObject));
        }

        // Set wheel properties
        this.wheels[0].steering = true;
        this.wheels[0].drive = 'fwd';
        this.wheels[1].drive = 'rwd';
        this.wheels[2].steering = true;
        this.wheels[2].drive = 'fwd';
        this.wheels[3].drive = 'rwd';

        // Set up seats
        this.seats = [];
        const seatPositions = [
            [0.25, 0.06 + h, 0.09],
            [-0.25, 0.06 + h, 0.09],
            [0.25, 0.06 + h, -0.45],
            [-0.25, 0.06 + h, -0.45]
        ] as const;

        // Set up entry points
        const entryPointPositions = [
            [1.00, -0.36 + h, -0.03],
            [-1.00, -0.36 + h, -0.03],
            [1.00, -0.36 + h, -0.60],
            [-1.00, -0.36 + h, -0.60]
        ] as const;

        // Get door objects from car2 model
        const door1 = carModel.getObjectByName("door_1") as THREE.Object3D;
        const door2 = carModel.getObjectByName("door_2") as THREE.Object3D;
        const door3 = carModel.getObjectByName("door_3") as THREE.Object3D;
        const door4 = carModel.getObjectByName("door_4") as THREE.Object3D;

        for (let i = 0; i < 4; i++) {
            const seatObject = new THREE.Object3D();
            seatObject.position.set(...seatPositions[i]);
            this.add(seatObject);

            const entryPoint = new THREE.Object3D();
            entryPoint.position.set(...entryPointPositions[i]);
            this.add(entryPoint);

            let door: THREE.Object3D;
            switch (i) {
                case 0:
                    door = door1;
                    break;
                case 1:
                    door = door2;
                    break;
                case 2:
                    door = door3;
                    break;
                case 3:
                    door = door4;
                    break;
                default:
                    throw new Error('Invalid seat index.');
            }

            const seat = new VehicleSeat(this, seatObject, carModel);
            seat.entryPoints.push(entryPoint);
            seat.door = new VehicleDoor(seat, door);
            this.seats.push(seat);
        }

        // Connect seats
        this.seats[0].connectedSeats = [this.seats[1]];
        this.seats[1].connectedSeats = [this.seats[0]];
        this.seats[2].connectedSeats = [this.seats[3]];
        this.seats[3].connectedSeats = [this.seats[2]];
        this.seats[0].type = SeatType.Driver;
        this.seats[1].type = SeatType.Passenger;
        this.seats[2].type = SeatType.Passenger;
        this.seats[3].type = SeatType.Passenger;

        // Set up camera
        this.camera = new THREE.Object3D();
        this.camera.position.set(0.24, 0.52 + h, -0.01);
        this.add(this.camera);

        // Set up collision
        const bodyShape = new CANNON.Box(new CANNON.Vec3(0.64, 0.53, 1.245));
        bodyShape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
        this.collision.addShape(bodyShape, new CANNON.Vec3(0, 0.37 + h, 0.04));

        const lowerBodyShape = new CANNON.Box(new CANNON.Vec3(0.61, 0.25, 1.21));
        this.collision.addShape(lowerBodyShape, new CANNON.Vec3(0, 0.09 + h, 0.04));

        const cabinShape = new CANNON.Box(new CANNON.Vec3(0.54, 0.28, 0.535));
        this.collision.addShape(cabinShape, new CANNON.Vec3(0, 0.62 + h, -0.26));

        const wheelShape = new CANNON.Cylinder(0.235, 0.235, 0.15, 32);
        for (let i = 0; i < 4; i++) {
            this.collision.addShape(wheelShape, new CANNON.Vec3(...wheelPositions[i]));
        }

        // Hide boxes and spheres
        carModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.name.includes("Sphere") || child.name.includes("bodycollider")) {
                    child.visible = false;
                }
                Utils.setupMeshProperties(child);

                if (child.material !== undefined) {
                    this.materials.push(child.material);
                }
            }
        });
    }

    public override inputReceiverUpdate(timeStep: number): void {
        super.inputReceiverUpdate(timeStep);

        // Handle shooting input
        if (this.controllingCharacter && this.actions.shoot.justPressed) {
            this.shoot();
        }
    }

    private shoot(): void {
        if (this.rocketLauncher) {
            this.rocketLauncher.shoot();
        }
    }
}




// IMPORTANT: Always use function AutoScale(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always use function expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

addMethodListener(world, world.update, () => {
    TWEEN.update();
});

class Player extends Character {
    // put player code here
    update(timeStep: number): void {
        super.update(timeStep);
    }

    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
    }

}


class RocketLauncher extends BaseObject {
    shootDelay: number;
    lastShootTime: number;

    constructor(model: THREE.Group) {
        super(model, 0.1);
        this.shootDelay = 1000;
        this.lastShootTime = 0;
    }

    public shoot(): void {
        if (Date.now() - this.lastShootTime > this.shootDelay) {
            this.lastShootTime = Date.now();
            this.shootBullet();
        }
    }

    shootBullet(): void {
        const bullet = new Bullet();
        bullet.position.copy(this.getWorldPosition(new THREE.Vector3()));
        const direction = player.viewVector.clone().normalize()
        bullet.direction.copy(direction);
        world.add(bullet);
        bullet.velocity = bullet.direction.multiplyScalar(20); // Increased velocity
    }
}


class Bullet extends THREE.Object3D {
    direction: THREE.Vector3;
    raycaster: THREE.Raycaster;
    maxDistance: number;
    distanceTraveled: number;
    velocity: THREE.Vector3;

    constructor() {
        super();
        const bulletGeometry = new THREE.SphereGeometry(0.1);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.add(bulletMesh);

        this.direction = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.maxDistance = 100;
        this.distanceTraveled = 0;
        this.velocity = new THREE.Vector3();
    }

    update(timeStep: number) {
        const oldPosition = this.position.clone();
        this.position.add(this.velocity.clone().multiplyScalar(timeStep));

        const distanceThisFrame = oldPosition.distanceTo(this.position);
        this.distanceTraveled += distanceThisFrame;

        if (this.distanceTraveled >= this.maxDistance) {
            world.remove(this);
            return;
        }

        this.raycaster.set(oldPosition, this.direction.normalize());
        const intersects = this.raycaster.intersectObjects(world.graphicsWorld.children, true);

        if (intersects.length > 0 && intersects[0].distance < distanceThisFrame) {
            this.handleCollision(intersects[0].object);
        }
    }

    handleCollision(object: THREE.Object3D) {
        console.log("Hit object:", object);
        world.remove(this);
    }
}