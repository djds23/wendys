import Phaser from 'phaser'
import * as R from 'ramda' 
import * as Constants from '../Constants'
import * as Movement from '../Movement/Movement'

interface InputHandler {
    register(callback: (update: InputUpdate, time: number) => void): void
    configure(): void
    update(time: number, delta: number): void
}

function leftStickToHorizontalMovement(vector: Phaser.Math.Vector2): Movement.HorizontalMovement {
    let ceiledX = Phaser.Math.Fuzzy.Floor(vector.x, 0.1)
    if (ceiledX < 0) return Movement.HorizontalMovement.LEFT;
    if (ceiledX > 0) return Movement.HorizontalMovement.RIGHT;
    return Movement.HorizontalMovement.STATIONARY; // If 0, then stationary
}

function leftStickToVerticalMovement(vector: Phaser.Math.Vector2): Movement.VerticalMovement {
    if (vector.y < -0.9) return Movement.VerticalMovement.JUMP;
    return Movement.VerticalMovement.STATIONARY;
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
            let direction = leftStickToHorizontalMovement(this.gamepad.leftStick)
            let jump = leftStickToVerticalMovement(this.gamepad.leftStick)
            let inputUpdate = new InputUpdate(direction, jump, action)
            callback(inputUpdate, time)
        })
    }

    actionForPad(): Action {
        if (this.gamepad.isButtonDown(0)) {
            return Action.ATTACK
        } else {
            return Action.NONE
        }
    }

    movementStyleForInputBuffer(previousHead: Phaser.Math.Vector2 | null, newHead: Phaser.Math.Vector2): Movement.MovementStyle {
        if (Math.round(newHead.x) == 0) {
            // console.log('stationary movement')
            return Movement.MovementStyle.STATIONARY
        } else {
            // if the new head is not == 0 and the previous one is, 
            // we need to check if one of the last 60 positions is 
            // 
            // Reversed for docs
            //
            // R SSSS R == DASH
            // L SSSSSSSS == RUN
            // L SSSR == RUN
            // LLLLLLLLLLL == RUN
            // S == STATIONARY
            if (previousHead != null && Math.round(previousHead.x) == 0) { // Posible Dash / Run
                // if the stick is not centered and the previous position is STATIONARY
                // We are either RUNNING or DASHING
                // count backwards through the array 
                // already checked the first two
                // Check to see that we are facing the same direction still
                // console.log("Dash check!")
                let currentXOrientation = newHead.x > 0
                for (let i=this.updateBuffer.length - 3; i < 0; i--) {
                    let currentInput = this.updateBuffer[i]
                    let currentX = currentInput.position.x
                    let isStationary = Math.round(currentX) == 0
                    if (isStationary == false) {
                        // if direction, neutral, then same direction happen, perform a dash
                        if (currentX > 0 == currentXOrientation) {
                            return Movement.MovementStyle.DASH
                        } else {
                        // if direction, neutral, then different direction happen, perform a run
                            return Movement.MovementStyle.RUN
                        }
                    }
                }
                
                // If we make it to the end of the buffer and never found a different direction, start a run
                return Movement.MovementStyle.RUN
            } else { // If we are not stationary or dashing, we are running
                return Movement.MovementStyle.RUN 
            }

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
            default:
                this.verticalMovement = null
                this.horizontalMovement = null
                this.action = null
        }
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

enum Action {
    DASH="DASH", ATTACK="ATTACK", SPECIAL="SPECIAL", NONE="NO-INPUT"
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

export {
    GamepadInputHandler,
    KeyboardInputHandler,
    InputHandler,
    Action,
    InputUpdate
}