globalThis.world = new World();
await world.initialize('build/assets/world.glb');

var textPrompt = globalThis.textPrompt = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

var loader = globalThis.loader = new GLTFLoader();

var playerModel = globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");
AutoScale(playerModel.scene, 1.7);

addMethodListener(world, world.update, function () {
    TWEEN.update();
});

class Player extends Character {
    constructor(model) {
        super(model);
        this.rhand = model.scene.getObjectByName("rhand");
        this.lhand = model.scene.getObjectByName("lhand");
        this.remapAnimations(model.animations);
        this.actions.interract = KeyBinding.CreateKeyBinding("R");
        this.heldWeapon = null;
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
}

var player = globalThis.player = new Player(playerModel); 
player.setPosition(0, 0, -5);
world.add(player);
player.takeControl();

class Weapon extends BaseObject {
    constructor(model) {
        super(model, 0.1);
        this.interract = function (player) {
            player.attachWeapon(this);
            world.remove(this);
        };
    }
}

var pistolModel = await loader.loadAsync('build/assets/pistol.glb');
var pistol = new Weapon(pistolModel.scene);
pistol.setPosition(0, 0, -2);
world.add(pistol);

world.startRenderAndUpdatePhysics?.();