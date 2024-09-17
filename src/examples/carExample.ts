import { Car } from '../ts/vehicles/Car';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { VehicleSeat } from '../ts/vehicles/VehicleSeat';
import { VehicleDoor } from '../ts/vehicles/VehicleDoor';
import { Wheel } from '../ts/vehicles/Wheel';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CollisionGroups } from '../ts/enums/CollisionGroups';
import * as Utils from '../ts/core/FunctionLibrary';

class ExtendedCar extends Car {
    constructor(gltf: GLTF) {
        super(gltf);
    }

    public override readVehicleData(gltf: GLTF): boolean {
        this.initCar(gltf.scene,0);
        return true;
    }

    private initCar(carModel: THREE.Group, h: number = 0.45): void {
        // Set up wheels
        //IMPORTANT: Replace with wheel objects from model
        this.wheels = [];
        const wheelPositions = [
            [0.53, -0.12 + h, 0.86],
            [0.53, -0.12 + h, -0.79],
            [-0.53, -0.12 + h, 0.86],
            [-0.53, -0.12 + h, -0.79]
        ] as const;

        for (let i = 0; i < 4; i++) {
            const wheelObject = new THREE.Object3D();
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

        for (let i = 0; i < 4; i++) {
            const seatObject = new THREE.Object3D();
            seatObject.position.set(...seatPositions[i]);
            this.add(seatObject);

            const entryPoint = new THREE.Object3D();
            entryPoint.position.set(...entryPointPositions[i]);
            this.add(entryPoint);

            const seat = new VehicleSeat(this, seatObject, carModel);
            seat.entryPoints.push(entryPoint);
            this.seats.push(seat);
        }

        // Set up doors
        //IMPORTANT: Replace with door objects from model
        const doorPositions = [
            [0.57, 0.13 + h, 0.21],
            [-0.57, 0.13 + h, 0.21],
            [0.57, 0.13 + h, -0.43],
            [-0.57, 0.13 + h, -0.43]
        ] as const;

        for (let i = 0; i < 4; i++) {
            const doorObject = new THREE.Object3D();
            doorObject.position.set(...doorPositions[i]);
            this.add(doorObject);
            this.seats[i].door = new VehicleDoor(this.seats[i], doorObject);
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

        // Set up materials
        this.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                Utils.setupMeshProperties(child);

                if (child.material !== undefined) {
                    this.materials.push(child.material);
                }
            }
        });
    }
}


// IMPORTANT: Always use function AutoScale(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always use function expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

const world = new World();
await world.initialize('build/assets/world.glb');

const textPrompt: HTMLDivElement = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

const playerModel = await loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");
AutoScale(playerModel.scene, 1.7);
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

const player = new Player(playerModel);
expose(player.moveSpeed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);

player.takeControl();
    

let acarModel = await new GLTFLoader().loadAsync("build/assets/car2.glb");
AutoScale(acarModel.scene, 5);
let acar = new ExtendedCar(acarModel);
world.add(acar);
acar.setPosition(0.57, -0.53, -3.45);