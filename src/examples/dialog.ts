export {};

// IMPORTANT: Always use function AutoScale(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always use function expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

const world = new World();
await world.initialize('build/assets/world.glb');

// Interactable Interface
interface Interactable {
    interact(player: Player): void;
    position: THREE.Vector3;
}

const interactableObjects: Interactable[] = [];

const textPrompt: HTMLDivElement = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

class Player extends Character {
    // put player code here
    update(timeStep: number): void {
        super.update(timeStep);
    }

    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
        this.handleInteractions();
    }

    handleInteractions(): void {
        textPrompt.textContent = ""; // Clear previous text
        for (let a of interactableObjects) {
            const distance = this.position.distanceTo(a.position);
            if (distance < 2) {
                textPrompt.textContent = "Press R to interact"; // Show prompt
                if (this.actions.interractKey.isPressed) {
                    a.interact(this);
                    break;
                }
            }
        }
    }
}

const playerModel = await loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");
AutoScale(playerModel.scene, 1.7);
const player = new Player(playerModel);
expose(player.moveSpeed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);
player.takeControl();

let aalkingModel = await new GLTFLoader().loadAsync("talking.glb");

let aalking = new Character(aalkingModel);
//CRITICAL: Uncomment and assign hands immediately! Use aalkingModel hierarchy to find the correct bones
// NOTE:  I'm assuming the hands are named "mixamorigRightHand_030" and "mixamorigLeftHand_010"
aalking.rhand = aalkingModel.scene.getObjectByName("mixamorigRightHand_030");
aalking.lhand = aalkingModel.scene.getObjectByName("mixamorigLeftHand_010");

            
/* CRITICAL: Uncomment and replace "???" with correct aniamtion name!
aalking.animationsMapping.??? = "mixamo.com";
*/
aalking.animationsMapping.idle = "Idle";
aalking.animationsMapping.talking = "mixamo.com"; // Replace "Talking" with the actual animation name

world.add(aalking);

// Make aalking interactable
interactableObjects.push({
    interact: (player: Player) => {
        // Play talking animation
        aalking.setAnimation("talking", 0, false);

        // Look at the player
        const lookDirection = new THREE.Vector3().subVectors(player.position, aalking.position).normalize();
        aalking.setOrientation(lookDirection);

        // Show dialog using Swal
        Swal.fire({
            title: 'Hello there!',
            text: "What's your name?",
            input: 'text',
            inputPlaceholder: 'Enter your name',
            showCancelButton: false,
            confirmButtonText: 'Reply'
        }).then((result) => {
            if (result.isConfirmed) {
                const reply = result.value;
                // Handle the reply (e.g., display a message, change animations)
                console.log("The player replied:", reply); 
                // Play talking animation again for the response
                aalking.setAnimation("talking", 0, false); 
                // Show a new dialog with the response
                Swal.fire({
                    title: `Nice to meet you, ${reply}!`,
                    text: '',
                    showCancelButton: false,
                    confirmButtonText: 'Continue'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Play talking animation again for the second response
                        aalking.setAnimation("talking", 0, false); 
                        // Show a final dialog
                        Swal.fire({
                            title: `It was good talking to you, ${reply}!`,
                            text: '',
                            showCancelButton: false,
                            confirmButtonText: 'Okay'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Play idle animation
                                aalking.setAnimation("idle", 0);
                            }
                        });
                    }
                });
            }
        });
        // Return to idle animation after the talking animation finishes
        aalking.mixer.addEventListener('finished', () => {
            aalking.setAnimation("idle", 0);
        });
    },
    position: aalking.position
});

addMethodListener(world, world.update, () => {
    TWEEN.update();
});