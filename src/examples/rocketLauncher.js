// Initialize the world
globalThis.world = new World();
await world.initialize('build/assets/world.glb');

// Create UI elements
var textPrompt = globalThis.textPrompt = createUIElement('div', "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);");
var crosshair = globalThis.crosshair = createUIElement('div', "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; border: 2px solid white; border-radius: 50%;");

var interactableObjects = [];
var loader = globalThis.loader = new GLTFLoader();
var playerModel = globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");

class Player extends Character {
    constructor(model) {
        super(model);
        this.setupProperties();
        this.setupActions();
    }

    setupProperties() {
        this.rhand = this.model.scene.getObjectByName("rhand");
        this.lhand = this.model.scene.getObjectByName("lhand");
        this.remapAnimations(this.model.animations);
        this.setupCameraSettings();
        this.heldWeapon = null;
    }

    setupActions() {
        this.actions.interractKey = KeyBinding.CreateKeyBinding("R");
        this.actions.aim = KeyBinding.CreateMouseBinding(2);
        this.actions.dropWeapon = KeyBinding.CreateKeyBinding("V");
    }

    setupCameraSettings() {
        this.originalSensitivity = world.cameraOperator.sensitivity.clone();
        this.aimingSpeed = 0.5;
        this.aimingFOV = 40;
        this.aimingOffset = new THREE.Vector3(-0.5, 0.3, 0.0);
        this.originalFOV = world.camera.fov;
    }

    remapAnimations(animations) {
        animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });
    }

    attachWeapon(weapon) {
        if (this.rhand) {
            this.rhand.attach(weapon);
            weapon.position.set(0, 0, 0);
            weapon.rotation.set(0, 0, 0);
            this.heldWeapon = weapon;
            world.remove(weapon);
        }
    }

    detachWeapon() {
        if (this.heldWeapon) {
            this.heldWeapon.removeFromParent();
            this.heldWeapon = null;
        }
    }

    inputReceiverUpdate(deltaTime) {
        super.inputReceiverUpdate(deltaTime);
        this.handleInteractions();
        this.handleAiming();
        this.handleWeaponDrop();
    }

    handleInteractions() {
        textPrompt.textContent = "";
        for (let object of interactableObjects) {
            if (this.position.distanceTo(object.position) < 2) {
                textPrompt.textContent = "Press R to interact";
                if (this.actions.interractKey.isPressed) {
                    object.interract(this);
                    break;
                }
            }
        }
    }

    handleAiming() {
        if (this.actions.aim.isPressed) {
            this.enableAimMode();
        } else {
            this.disableAimMode();
        }
    }

    enableAimMode() {
        world.camera.fov += (this.aimingFOV - world.camera.fov) * 0.1;
        world.cameraOperator.sensitivity.set(this.aimingSpeed, this.aimingSpeed);
        const cameraDirection = world.camera.getWorldDirection(new THREE.Vector3());
        const rotatedOffset = this.aimingOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(cameraDirection.x, cameraDirection.z));
        world.cameraOperator.target.add(rotatedOffset);
        world.camera.updateProjectionMatrix();
        crosshair.style.display = 'block';
        const aimDirection = world.camera.getWorldDirection(new THREE.Vector3());
        aimDirection.y = 0;
        aimDirection.normalize();
        this.setOrientation(aimDirection, false);
    }

    disableAimMode() {
        world.camera.fov = this.originalFOV;
        world.camera.updateProjectionMatrix();
        world.cameraOperator.sensitivity.copy(this.originalSensitivity);
        crosshair.style.display = 'none';
    }

    handleWeaponDrop() {
        if (this.actions.dropWeapon.justPressed) {
            this.detachWeapon();
        }
    }

    handleMouseButton(event, code, pressed) {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true && this.heldWeapon) {
            this.heldWeapon.shoot();
        }
    }
}

var player = globalThis.player = new Player(playerModel);
player.setPosition(0, 0, -5);
world.add(player);

addMethodListener(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6);
});
player.takeControl();

world.startRenderAndUpdatePhysics?.();

class Weapon extends BaseObject {
    constructor(model) {
        super(model, 0.1);
        this.shootDelay = 1000;
        this.lastShootTime = 0;
    }

    interract(player) {
        player.attachWeapon(this);
        world.remove(this);
        const index = interactableObjects.indexOf(this);
        if (index > -1) {
            interactableObjects.splice(index, 1);
        }
    }

    shoot() {
        if (Date.now() - this.lastShootTime > this.shootDelay) {
            this.lastShootTime = Date.now();
            this.shootGrenade();
        }
    }

    shootGrenade() {
        var grenadeModel = globalThis.grenadeModel = loader.loadAsync('build/assets/grenade.glb').then(gltf => {
            return gltf.scene;
        });
        grenadeModel.then(grenadeModel => {
            AutoScale(grenadeModel, 0.1);
            var grenade = new BaseObject(grenadeModel, 0.1);
            grenade.setPosition(this.getWorldPosition().clone());
            var cameraDirection = new THREE.Vector3();
            world.camera.getWorldDirection(cameraDirection);
            var force = 30;
            var up = new THREE.Vector3(0, 1, 0);
            var direction = cameraDirection.multiplyScalar(force).add(up);
            grenade.body.velocity = Utils.cannonVector(direction);
            world.add(grenade);
            grenade.body.collisionFilterMask = ~2;
            grenade.body.addEventListener('collide', (event) => {
                var otherBody = event.body;
                if (otherBody !== player.characterCapsule.body) {
                    console.log('Grenade hit!');
                    world.remove(grenade);
                    explodeGrenade(grenade.position);
                }
            });
        });
    }
}

async function explodeGrenade(position) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.8 });
    const explosion = new THREE.Mesh(geometry, material);
    explosion.position.copy(position);
    world.graphicsWorld.add(explosion);

    const animateDuration = 500;

    new TWEEN.Tween(explosion.scale)
        .to({ x: 4, y: 4, z: 4 }, animateDuration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            explosion.material.opacity = 0.8 * (1 - (explosion.scale.x / 4));
        })
        .onComplete(() => {
            world.graphicsWorld.remove(explosion);
        })
        .start();

    function update() {
        TWEEN.update();
        requestAnimationFrame(update);
    }
    update();
}

var rocketLauncherModel = await loader.loadAsync('build/assets/rocketlauncher.glb');
var rocketLauncher = new Weapon(rocketLauncherModel.scene);
world.add(rocketLauncher);
rocketLauncher.setPosition(1, 0, -2);
expose(rocketLauncherModel.scene, "rocketlauncher");
interactableObjects.push(rocketLauncher);

class NPC extends Character {
    constructor(model, dialog) {
        super(model);
        this.dialog = dialog;
    }

    interract(player) {
        Swal.fire({
            title: this.dialog,
            toast: false,
            showCancelButton: true,
            confirmButtonText: 'Follow',
        }).then((result) => {
            if (result.isConfirmed) {
                this.setBehaviour(new FollowTarget(player));
            }
        });
    }
}

const npcs = [];
const npcPositions = [];

for (let i = 0; i < npcPositions.length; i++) {
    const npcModel = await loader.loadAsync('build/assets/boxman.glb');
    const npc = new NPC(npcModel, npcPositions[i].dialog);
    npc.setPosition(npcPositions[i].x, npcPositions[i].y, npcPositions[i].z);
    npcs.push(npc);
    world.add(npc);
    interactableObjects.push(npc);
}

function createUIElement(type, style) {
    const element = document.createElement(type);
    element.style.cssText = style;
    document.body.appendChild(element);
    return element;
}
