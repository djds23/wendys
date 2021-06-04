import Phaser from 'phaser'
import * as R from 'ramda' 
import * as Movement from './scenes/Movement/Movement'

interface InputHandler {
    configure(scene: Phaser.Scene): void
    removeFromScene(scene: Phaser.Scene): void

    update(time: number, delta: number): InputUpdate | null
}

class InputUpdate {
    // direction you are moving
    horizontal: Movement.HorizontalMovement
    veritcal: Movement.VerticalMovement
    actions: Array<Action>
    time: number
    constructor(
        horizontal: Movement.HorizontalMovement,
        veritcal: Movement.VerticalMovement,
        actions: Array<Action>,
        time: number
        ) {
        this.horizontal = horizontal
        this.veritcal = veritcal
        this.actions = actions
        this.time = time
    }

    equals(otherInput: InputUpdate | null): boolean {
        if (otherInput == null) {
            return false
        } else {
            return (R.equals(this.actions, otherInput.actions)) && 
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
    acceptanceLimit: number = 20
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
    callbacks: Array<(update: InputUpdate) => void> = []
    configure(scene: Phaser.Scene) { 
        if (scene.input.gamepad.total == 0) {
            scene.input.gamepad.on(Phaser.Input.Gamepad.Events.CONNECTED, (pad) => {
                this.gamepad = pad
            })
        } else {
            let newPad = scene.input.gamepad.pad1
            this.gamepad = newPad
        }

    }

    removeFromScene(scene: Phaser.Scene): void {
        this.callbacks = []
        this.gamepad?.removeListener(Phaser.Input.Gamepad.Events.BUTTON_DOWN)
        this.gamepad?.removeListener(Phaser.Input.Gamepad.Events.CONNECTED)
    }


    update(time, delta): InputUpdate | null {
        if (this.gamepad == null) {
            // console.log("Attempting to update gamepad when none attached")
            return null
        }
        return this.inputUpdateFor(this.gamepad, time)
    }

    inputUpdateFor(gamepad: Phaser.Input.Gamepad.Gamepad, time: number): InputUpdate {
        let direction = this.leftStickToHorizontalMovement(gamepad.leftStick)
        let jump = this.leftStickToVerticalMovement(gamepad.leftStick)
        let actions = this.actionsForPad(gamepad)
        return new InputUpdate(direction, jump, actions, time)
    }

    updateCallbacks(inputUpdate: InputUpdate) {
        this.callbacks.forEach((callback) => {
            callback(inputUpdate)
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
    actionsForPad(gamepad:Phaser.Input.Gamepad.Gamepad): Array<Action> {
        let output = new Array<Action>()
        if (gamepad.isButtonDown(0)) {
            output.push(Action.ATTACK)
        } else if (gamepad.isButtonDown(9)){
            output.push(Action.START)
        }
        return output
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

     }

    update(time: number, delta: number): InputUpdate | null {
        let downKeys = this.keys.filter((value) => value.key.isDown)
        return this.keyToUpdate(downKeys, time)
    }

    keyToUpdate(downKeys: Array<KeyToInputs>, time: number): InputUpdate | null {
        if (R.isEmpty(downKeys)) {
            return null
        } else {
            let vertical = Movement.VerticalMovement.STATIONARY
            let horizontal = Movement.HorizontalMovement.STATIONARY
            let actionOutput = new Array<Action>()
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
                    actionOutput.push(keyToInput.action)
                }
            })
            return new InputUpdate(
                horizontal, 
                vertical,
                actionOutput,
                time
            )
        }
    }
}

class DummyInputHandler implements InputHandler {
    cycle: Array<InputUpdate> = []
    currentIndex: number = 0

    removeFromScene(scene: Phaser.Scene): void {
    }

    configure(): void { }

    update(time: number, delta: number): InputUpdate | null {
        return null
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