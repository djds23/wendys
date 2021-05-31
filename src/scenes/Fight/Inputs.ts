import Phaser from 'phaser'
import * as R from 'ramda' 
import * as Constants from '../Constants'
import * as Movement from '../Movement/Movement'

interface InputHandler {
    register(callback: (update: Movement.MovementUpdate, time: number) => void)
    configure()
    update(time: number, delta: number)
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
    callbacks: Array<(update: Movement.MovementUpdate, time: number) => void> = []
    updateBuffer: Array<{position: Phaser.Math.Vector2, time: number}> = []
    stickOrigin = Phaser.Math.Vector2.ZERO
    constructor(gamepad: Phaser.Input.Gamepad.Gamepad) {
        this.gamepad = gamepad
    }
    configure() { }

    register(callback: (update: Movement.MovementUpdate, time: number) => void) {
        this.callbacks.push(callback)
    }

    update(time, delta) {
        let stickXY = this.gamepad.leftStick
        let previousInput = this.updateBuffer[this.updateBuffer.length - 1]

        // update the buffer before further calculations
        this.updateBuffer.push({ position: stickXY, time: time })

        // we want this called whenever the stick isn't stuck at origin
        // and 
        if (previousInput == null) {
            if (this.stickVectorEquality(stickXY, this.stickOrigin) == false) {
                this.updateCallbacks(null, stickXY, time)
            }
        } else {
            let previousXY = previousInput.position
            let previousAtOrigin = this.stickVectorEquality(previousXY, this.stickOrigin)
            let hasntMoved = this.stickVectorEquality(previousXY, stickXY)
            let stuckAtOrigin = previousAtOrigin && hasntMoved
            if (stuckAtOrigin == false) {
                this.updateCallbacks(previousXY, stickXY, time)
            }
            this.updateBuffer = R.takeLast(Constants.EXPECTED_FPS_RUNTIME, this.updateBuffer)
        }
    }
    updateCallbacks(previousHead: Phaser.Math.Vector2 | null, newHead: Phaser.Math.Vector2, time: number) {
        this.callbacks.forEach((callback) => {
            let direction = leftStickToHorizontalMovement(this.gamepad.leftStick)
            let ceiledX = Math.round(newHead.x)
            // console.log("direction " + direction + " ceiledX " + ceiledX + " originX " + newHead.x + " at time " + time)
            let jump = leftStickToVerticalMovement(this.gamepad.leftStick)
            let playerFacingDirection = Movement.HorizontalMovement.RIGHT
            let style = this.movementStyleForInputBuffer(previousHead, newHead)
            let movementUpdate = new Movement.MovementUpdate(direction, jump, playerFacingDirection, style)
            callback(movementUpdate, time)
        })
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

class KeyMap { 
    map: any
    constructor() {
        this.map = {}
        this.map[Phaser.Input.Keyboard.KeyCodes.W] = Movement.VerticalMovement.JUMP
        this.map[Phaser.Input.Keyboard.KeyCodes.S] = Movement.VerticalMovement.STATIONARY
        this.map[Phaser.Input.Keyboard.KeyCodes.A] = Movement.HorizontalMovement.LEFT
        this.map[Phaser.Input.Keyboard.KeyCodes.D] = Movement.HorizontalMovement.RIGHT
    }
    key(keycode: number): Movement.VerticalMovement | Movement.HorizontalMovement {
        return this.map[keycode]
    }
}
class KeyboardInputHandler implements InputHandler {
    keyboard: Phaser.Input.Keyboard.KeyboardPlugin
    keys: Array<Phaser.Input.Keyboard.Key> = []
    keyMap = new KeyMap()
    callbacks: Array<(update: Movement.MovementUpdate, time: number) => void> = []
    constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
        this.keyboard = keyboard
    }
    register(callback: (update: Movement.MovementUpdate, time: number) => void) {
        this.callbacks.push(callback)
    }
    configure() {
        this.keys = [
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.S,
            Phaser.Input.Keyboard.KeyCodes.D,
        ].map((keycode) => {
            return this.keyboard.addKey(keycode, true)
        })
    }

    update(time: number, delta: number) {
        let downKeys = this.keys.filter((value) => value.isDown)
        let movementUpdate = this.keyToUpdate(downKeys)
        if (movementUpdate != null) {
            this.callbacks.forEach((callback) => {
                callback(movementUpdate!, time)
            })
        }
    }

    keyToUpdate(downKeys: Array<Phaser.Input.Keyboard.Key>): Movement.MovementUpdate | null {
        if (R.isEmpty(downKeys)) {
            return null
        } else {
            let vertical = Movement.VerticalMovement.STATIONARY
            let horizontal = Movement.HorizontalMovement.STATIONARY
            downKeys.forEach((key) => {
                let direction = this.keyMap.key(key.keyCode) 
                if (direction === Movement.VerticalMovement.JUMP) {
                    vertical = direction
                } else if (direction === Movement.HorizontalMovement.LEFT ||
                        direction === Movement.HorizontalMovement.RIGHT) {
                    if (horizontal === Movement.HorizontalMovement.STATIONARY) {
                        horizontal = direction
                    } else {
                        horizontal =  Movement.HorizontalMovement.STATIONARY
                    }
                }
            })
            return new Movement.MovementUpdate(
                horizontal, 
                vertical, 
                Movement.HorizontalMovement.RIGHT, 
                Movement.MovementStyle.RUN
            )
        }
    }
}

export {
    GamepadInputHandler,
    KeyboardInputHandler,
    InputHandler
}