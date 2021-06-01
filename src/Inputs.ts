import Phaser from 'phaser'
import * as R from 'ramda' 
import * as Movement from './scenes/Movement/Movement'

interface InputHandler {
    register(callback: (update: InputUpdate, time: number) => void): void

    configure(scene: Phaser.Scene): void
    removeFromScene(scene: Phaser.Scene): void

    update(time: number, delta: number): void
}

class InputUpdate {
    // direction you are moving
    horizontal: Movement.HorizontalMovement
    veritcal: Movement.VerticalMovement
    action: Action
    // direction you are facing
    constructor(
        horizontal: Movement.HorizontalMovement,
        veritcal: Movement.VerticalMovement,
        action: Action
        ) {
        this.horizontal = horizontal
        this.veritcal = veritcal
        this.action = action
    }

    equals(otherInput: InputUpdate | null): boolean {
        if (otherInput == null) {
            return false
        } else {
            return (this.action === otherInput.action) && 
            (this.veritcal === otherInput.veritcal) &&
            (this.horizontal === otherInput.horizontal)
        }
    }
}

enum Action {
    DASH="DASH", ATTACK="ATTACK", SPECIAL="SPECIAL", NONE="NO-INPUT", START="START"
}

class Step {
    timeSinceAccept: number = 0
    acceptanceLimit: number = 50
    shouldStepWithDelta(delta: number) {
        this.timeSinceAccept += delta
        if (this.timeSinceAccept > this.acceptanceLimit) {
            this.timeSinceAccept = 0
            return true
        } else {
            return false
        }
    }
}

class GamepadInputHandler implements InputHandler {
    gamepad: Phaser.Input.Gamepad.Gamepad | null = null
    previousUpdate: InputUpdate | null = null
    callbacks: Array<(update: InputUpdate, time: number) => void> = []
   
    configure(scene: Phaser.Scene) { 
        if (scene.input.gamepad.total == 0) {
            scene.input.gamepad.on(Phaser.Input.Gamepad.Events.CONNECTED, (pad) => {
                this.gamepad = pad
                this.gamepad?.on(Phaser.Input.Gamepad.Events.GAMEPAD_BUTTON_UP, (index, value, button) => {
                    if (index === 9) {
                        let newUpdate = this.inputUpdateFor(pad)
                        this.updateCallbacks(newUpdate, pad.timestamp)
                    }
                })  
            })
        } else {
            let newPad = scene.input.gamepad.pad1
            this.gamepad = newPad
            this.gamepad?.on(Phaser.Input.Gamepad.Events.GAMEPAD_BUTTON_UP, (index, value, button) =>{
                if (index === 9) {
                    let newUpdate = this.inputUpdateFor(newPad)
                    this.updateCallbacks(newUpdate, newPad.timestamp)
                }
            })  
        }

    }

    removeFromScene(scene: Phaser.Scene): void {
        this.callbacks = []
        this.gamepad?.removeListener(Phaser.Input.Gamepad.Events.BUTTON_DOWN)
        this.gamepad?.removeListener(Phaser.Input.Gamepad.Events.CONNECTED)
    }

    register(callback: (update: InputUpdate, time: number) => void) {
        this.callbacks.push(callback)
    }

    update(time, delta) {
        if (this.gamepad == null) {
            console.log("Attempting to update gamepad when none attached")
            return;
        }
        let newUpdate = this.inputUpdateFor(this.gamepad)

        if (newUpdate.equals(this.previousUpdate) === false) {
            this.updateCallbacks(newUpdate, time)
        }
    }

    inputUpdateFor(gamepad: Phaser.Input.Gamepad.Gamepad): InputUpdate {
        let direction = this.leftStickToHorizontalMovement(gamepad.leftStick)
        let jump = this.leftStickToVerticalMovement(gamepad.leftStick)
        let action = this.actionForPad(gamepad)
        return new InputUpdate(direction, jump, action)
    }

    updateCallbacks(inputUpdate: InputUpdate, time: number) {
        this.callbacks.forEach((callback) => {
            callback(inputUpdate, time)
        })
    }

    leftStickToHorizontalMovement(vector: Phaser.Math.Vector2): Movement.HorizontalMovement {
        let ceiledX = Math.round(vector.x)
        if (ceiledX < 0) return Movement.HorizontalMovement.LEFT;
        if (ceiledX > 0) return Movement.HorizontalMovement.RIGHT;
        return Movement.HorizontalMovement.STATIONARY; // If 0, then stationary
    }
    
    leftStickToVerticalMovement(vector: Phaser.Math.Vector2): Movement.VerticalMovement {
        if (vector.y < -0.9) return Movement.VerticalMovement.JUMP;
        return Movement.VerticalMovement.STATIONARY;
    }
    actionForPad(gamepad:Phaser.Input.Gamepad.Gamepad): Action {
        if (gamepad.isButtonDown(0)) {
            return Action.ATTACK
        } else {
            return Action.NONE
        }
    }

    stickVectorEquality(lhs: Phaser.Math.Vector2, rhs: Phaser.Math.Vector2): boolean {
        return Math.round(lhs.x) == Math.round(rhs.x) && 
        Math.round(lhs.y) == Math.round(rhs.y)
    }
}

class NoRegisteredGamepad extends Error {
    constructor(message) {
        super(message)
        this.name = 'NoRegisteredGamepad'
    }
}

class KeyToInputs {
    key: Phaser.Input.Keyboard.Key
    verticalMovement: Movement.VerticalMovement | null
    horizontalMovement: Movement.HorizontalMovement | null
    action: Action | null

    constructor(
        key: Phaser.Input.Keyboard.Key
    ) {
        this.key = key
        switch(key.keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.W:
                this.verticalMovement = Movement.VerticalMovement.JUMP
                this.horizontalMovement = null
                this.action = null
                break;
            case Phaser.Input.Keyboard.KeyCodes.S:
                this.verticalMovement = Movement.VerticalMovement.STATIONARY
                this.horizontalMovement = null
                this.action = null
                break;
            case Phaser.Input.Keyboard.KeyCodes.A:
                this.verticalMovement = null
                this.horizontalMovement = Movement.HorizontalMovement.LEFT
                this.action = null
                break;
            case Phaser.Input.Keyboard.KeyCodes.D:
                this.verticalMovement = null
                this.horizontalMovement = Movement.HorizontalMovement.RIGHT
                this.action = null
                break;
            case Phaser.Input.Keyboard.KeyCodes.J:
                this.verticalMovement = null
                this.horizontalMovement = null
                this.action = Action.ATTACK
                break;
            case Phaser.Input.Keyboard.KeyCodes.ESC:
                this.verticalMovement = null
                this.horizontalMovement = null
                this.action = Action.START
                break;
            default:
                throw new UnhandledKeyError("Key for code is unhandled: " + key.keyCode)
        }
    }
}

class UnhandledKeyError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnhandledKeyError";
    }
}
class KeyboardInputHandler implements InputHandler {

    keys: Array<KeyToInputs> = []
    callbacks: Array<(update: InputUpdate, time: number) => void> = []

    register(callback: (update: InputUpdate, time: number) => void) {
        this.callbacks.push(callback)
    }

    configure(scene: Phaser.Scene) {
        this.keys = [
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.S,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.J,
            Phaser.Input.Keyboard.KeyCodes.ESC,
        ].map((keycode) => {
            return new KeyToInputs(scene.input.keyboard.addKey(keycode, true))
        })
    }
    
    removeFromScene(scene: Phaser.Scene): void {
        this.callbacks = []
     }

    update(time: number, delta: number) {
        let downKeys = this.keys.filter((value) => value.key.isDown)
        let inputUpdate = this.keyToUpdate(downKeys)
        if (inputUpdate != null) {
            this.callbacks.forEach((callback) => {
                callback(inputUpdate!, time)
            })
        }
    }

    keyToUpdate(downKeys: Array<KeyToInputs>): InputUpdate | null {
        if (R.isEmpty(downKeys)) {
            return null
        } else {
            let vertical = Movement.VerticalMovement.STATIONARY
            let horizontal = Movement.HorizontalMovement.STATIONARY
            let action = Action.NONE
            downKeys.forEach((keyToInput) => {
                if (keyToInput.verticalMovement != null) {
                    vertical = keyToInput.verticalMovement
                } else if (keyToInput.horizontalMovement != null) {
                    if (horizontal === Movement.HorizontalMovement.STATIONARY) {
                        horizontal = keyToInput.horizontalMovement
                    } else {
                        horizontal =  Movement.HorizontalMovement.STATIONARY
                    }
                } else if (keyToInput.action != null) {
                    action = keyToInput.action
                }
            })
            return new InputUpdate(
                horizontal, 
                vertical,
                action
            )
        }
    }
}

class DummyInputHandler implements InputHandler {
    callbacks: Array<(update: InputUpdate, time: number) => void> = []
    cycle: Array<InputUpdate> = []
    currentIndex: number = 0
    constructor() {
        this.cycle.push(
            new InputUpdate(
                Movement.HorizontalMovement.LEFT,
                Movement.VerticalMovement.STATIONARY,
                Action.NONE  
            )
        )
        this.cycle.push(
            new InputUpdate(
                Movement.HorizontalMovement.LEFT,
                Movement.VerticalMovement.STATIONARY,
                Action.NONE  
            )
        )
        this.cycle.push(
            new InputUpdate(
                Movement.HorizontalMovement.RIGHT,
                Movement.VerticalMovement.STATIONARY,
                Action.NONE  
            )
        )
        this.cycle.push(
            new InputUpdate(
                Movement.HorizontalMovement.RIGHT,
                Movement.VerticalMovement.STATIONARY,
                Action.NONE  
            )
        )
    }
    removeFromScene(scene: Phaser.Scene): void {
        this.callbacks = []
     }

    register(callback: (update: InputUpdate, time: number) => void): void {
        this.callbacks.push(callback)
    }

    configure(): void { }

    update(time: number, delta: number): void {
        if (time % 5 == 0) {
            this.callbacks.forEach(callback => callback(this.cycle[this.currentIndex], time))
            let nextIndex = this.currentIndex + 1
            this.currentIndex = nextIndex > this.cycle.length - 1 ? 0 : nextIndex
        }
    }

}
export {
    GamepadInputHandler,
    KeyboardInputHandler,
    InputHandler,
    Action,
    InputUpdate,
    DummyInputHandler
}