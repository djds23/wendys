import Phaser, { Input } from 'phaser'
import * as R from 'ramda' 
import * as Constants from '../Constants'
import * as Movement from '../Movement/Movement'

interface InputHandler {
    register(callback: (update: InputUpdate, time: number) => void): void
    configure(): void
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
}

enum Action {
    DASH="DASH", ATTACK="ATTACK", SPECIAL="SPECIAL", NONE="NO-INPUT", START="START"
}

class GamepadInputHandler implements InputHandler {
    gamepad: Phaser.Input.Gamepad.Gamepad
    callbacks: Array<(update: InputUpdate, time: number) => void> = []
    updateBuffer: Array<{position: Phaser.Math.Vector2, time: number}> = []
    stickOrigin = Phaser.Math.Vector2.ZERO
    constructor(gamepad: Phaser.Input.Gamepad.Gamepad) {
        this.gamepad = gamepad
    }
    configure() { }

    register(callback: (update: InputUpdate, time: number) => void) {
        this.callbacks.push(callback)
    }

    update(time, delta) {
        let stickXY = this.gamepad.leftStick
        let previousInput = this.updateBuffer[this.updateBuffer.length - 1]
        let action = this.actionForPad()
        // update the buffer before further calculations
        this.updateBuffer.push({ position: stickXY, time: time })

        // we want this called whenever the stick isn't stuck at origin
        // and 
        if (previousInput == null) {
            if (this.stickVectorEquality(stickXY, this.stickOrigin) == false) {
                this.updateCallbacks(time, action)
            }
        } else if (action !== Action.NONE) { 
            this.updateCallbacks(time, action)
        } else {
            let previousXY = previousInput.position
            let previousAtOrigin = this.stickVectorEquality(previousXY, this.stickOrigin)
            let hasntMoved = this.stickVectorEquality(previousXY, stickXY)
            let stuckAtOrigin = previousAtOrigin && hasntMoved
            if (stuckAtOrigin == false) {
                this.updateCallbacks(time, action)
            } 
            this.updateBuffer = R.takeLast(Constants.EXPECTED_FPS_RUNTIME, this.updateBuffer)
        }
    }
    updateCallbacks(time: number, action: Action) {
        this.callbacks.forEach((callback) => {
            let direction = this.leftStickToHorizontalMovement(this.gamepad.leftStick)
            let jump = this.leftStickToVerticalMovement(this.gamepad.leftStick)
            let inputUpdate = new InputUpdate(direction, jump, action)
            callback(inputUpdate, time)
        })
    }
    leftStickToHorizontalMovement(vector: Phaser.Math.Vector2): Movement.HorizontalMovement {
        let ceiledX = Phaser.Math.Fuzzy.Floor(vector.x, 0.1)
        if (ceiledX < 0) return Movement.HorizontalMovement.LEFT;
        if (ceiledX > 0) return Movement.HorizontalMovement.RIGHT;
        return Movement.HorizontalMovement.STATIONARY; // If 0, then stationary
    }
    
    leftStickToVerticalMovement(vector: Phaser.Math.Vector2): Movement.VerticalMovement {
        if (vector.y < -0.9) return Movement.VerticalMovement.JUMP;
        return Movement.VerticalMovement.STATIONARY;
    }
    actionForPad(): Action {
        if (this.gamepad.isButtonDown(0)) {
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

    keyboard: Phaser.Input.Keyboard.KeyboardPlugin
    keys: Array<KeyToInputs> = []
    callbacks: Array<(update: InputUpdate, time: number) => void> = []

    constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
        this.keyboard = keyboard
    }

    register(callback: (update: InputUpdate, time: number) => void) {
        this.callbacks.push(callback)
    }

    configure() {
        this.keys = [
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.S,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.J,
            Phaser.Input.Keyboard.KeyCodes.ESC,
        ].map((keycode) => {
            return new KeyToInputs(this.keyboard.addKey(keycode, true))
        })
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