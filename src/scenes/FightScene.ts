import Phaser from 'phaser'
import PlayerState from './Fight/PlayerState'
import { HorizontalMovement, VerticalMovement, MovementUpdate, MovementStyle } from './Fight/Movement'
import TimeUpdate from './Fight/Time'
import Environment from '../Environment'
import * as R from 'ramda' 

const EXPECTED_FPS_RUNTIME = 60
interface Asset {
    key: string
    path: string
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig | undefined
}

class BlueWitch {
    static attack: Asset = {
        key: "assets/images/Blue_witch/B_witch_attack.png",
        path: "assets/images/Blue_witch/B_witch_attack.png",
        frameConfig: {
            frameWidth: 104,
            frameHeight: 46
        }
    }

    static idle: Asset = {
        key: "assets/images/Blue_witch/B_witch_idle.png",
        path: "assets/images/Blue_witch/B_witch_idle.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }
}

class Stage {
    static ground: Asset = {
        key: "assets/images/ground.png",
        path: "assets/images/ground.png",
        frameConfig: undefined
    }
}

class Current {
    p1: PlayerState | null = null
    pad: Phaser.Input.Gamepad.Gamepad | null = null
}

export default class FightScene extends Phaser.Scene {
    current: Current = new Current();
    inputTextLines = new Array<Phaser.GameObjects.Text>()
    recentMovementInputs = new Array<MovementUpdate>()

    gamepadEventHandler: InputHandler | null = null
    constructor() {
        super('FightScene')
    }

    preload() {
        this.load.setBaseURL(Environment.baseURL)

        this.load.image(Stage.ground.key, Stage.ground.path)
        this.load.spritesheet(BlueWitch.attack.key, BlueWitch.attack.path, BlueWitch.attack.frameConfig)
        this.load.spritesheet(BlueWitch.idle.key, BlueWitch.idle.path, BlueWitch.idle.frameConfig)
    }

    create() {
        this.addInputText()
        let ground = this.physics.add.staticImage(400, 576, Stage.ground.key)
        // Animation set
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers(BlueWitch.idle.key, { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 8,
            repeat: -1,
            duration: 2
        });

        // Animation set
        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers(BlueWitch.attack.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
            frameRate: 9,
            duration: 0.1
        });

        let idle = this.physics.add.sprite(0, 0, BlueWitch.idle.key, 0)
        let attack = this.physics.add.sprite(0, 0, BlueWitch.attack.key, 0)
        this.current.p1 = new PlayerState(
            idle,
            attack
        )
        if (this.input.gamepad.total === 0) {
            this.input.gamepad.once('connected', pad => {

                this.current.pad = pad;
                this.gamepadEventHandler = new InputHandler(pad)
                this.gamepadEventHandler.register((pad, movementUpdate, time) => {
                    this.current.p1?.update(movementUpdate)
                    this.recentMovementInputs.unshift(movementUpdate)
                })
                pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (index, value, button) => {
                    if (index === 0) {
                        this.current.p1?.performAttack()
                    }
                });
            });
        }
        else {
            this.current.pad = this.input.gamepad.pad1;
        }
        this.current.p1.configure(this, ground)
    }

    update(time, delta) {
        this.gamepadEventHandler?.update(time, delta)
        this.updateInputText()
    }
    addInputText() {
        for (let y=20; y <= 240; y+=20) {
            this.inputTextLines.push(
                this.add.text(20, y, "")
            )
        }

    }

    updateInputText() {
        this.recentMovementInputs = this.recentMovementInputs.slice(0, 14)
        this.inputTextLines.forEach((object, index) => {
            let movement = this.recentMovementInputs[index]
            object.text = JSON.stringify(movement) 
        })
    }
}

function leftStickToHorizontalMovement(vector: Phaser.Math.Vector2): HorizontalMovement {
    let ceiledX = Phaser.Math.Fuzzy.Floor(vector.x, 0.1)
    if (ceiledX < 0) return HorizontalMovement.LEFT;
    if (ceiledX > 0) return HorizontalMovement.RIGHT;
    return HorizontalMovement.STATIONARY; // If 0, then stationary
}

function leftStickToVerticalMovement(vector: Phaser.Math.Vector2): VerticalMovement {
    if (vector.y < -0.9) return VerticalMovement.JUMP;
    return VerticalMovement.STATIONARY;
}

class InputHandler {
    gamepad: Phaser.Input.Gamepad.Gamepad
    callbacks: Array<(pad: Phaser.Input.Gamepad.Gamepad, update: MovementUpdate, time: number) => void> = []
    updateBuffer: Array<{position: Phaser.Math.Vector2, time: number}> = []
    stickOrigin = Phaser.Math.Vector2.ZERO
    constructor(gamepad: Phaser.Input.Gamepad.Gamepad) {
        this.gamepad = gamepad
    }

    register(callback: (pad: Phaser.Input.Gamepad.Gamepad, update: MovementUpdate, time: number) => void) {
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
            this.updateBuffer = R.takeLast(EXPECTED_FPS_RUNTIME, this.updateBuffer)
        }
    }
    updateCallbacks(previousHead: Phaser.Math.Vector2 | null, newHead: Phaser.Math.Vector2, time: number) {
        this.callbacks.forEach((callback) => {
            let direction = leftStickToHorizontalMovement(this.gamepad.leftStick)
            let ceiledX = Phaser.Math.Fuzzy.Floor(newHead.x, 0.1)
            console.log("direction " + direction + " ceiledX " + ceiledX + " originX " + newHead.x + " at time " + time)
            let jump = leftStickToVerticalMovement(this.gamepad.leftStick)
            let playerFacingDirection = HorizontalMovement.RIGHT
            let style = this.movementStyleForInputBuffer(previousHead, newHead)
            let movementUpdate = new MovementUpdate(direction, jump, playerFacingDirection, style)
            callback(this.gamepad, movementUpdate, time)
        })
    }

    movementStyleForInputBuffer(previousHead: Phaser.Math.Vector2 | null, newHead: Phaser.Math.Vector2): MovementStyle {
        if (Math.round(newHead.x) == 0) {
            console.log('stationary movement')
            return MovementStyle.STATIONARY
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
                console.log("Dash check!")
                let currentXOrientation = newHead.x > 0
                for (let i=this.updateBuffer.length - 3; i < 0; i--) {
                    let currentInput = this.updateBuffer[i]
                    let currentX = currentInput.position.x
                    let isStationary = Math.round(currentX) == 0
                    if (isStationary == false) {
                        // if direction, neutral, then same direction happen, perform a dash
                        if (currentX > 0 == currentXOrientation) {
                            return MovementStyle.DASH
                        } else {
                        // if direction, neutral, then different direction happen, perform a run
                            return MovementStyle.RUN
                        }
                    }
                }
                
                // If we make it to the end of the buffer and never found a different direction, start a run
                return MovementStyle.RUN
            } else { // If we are not stationary or dashing, we are running
                return MovementStyle.RUN 
            }

        }
    }
    stickVectorEquality(lhs: Phaser.Math.Vector2, rhs: Phaser.Math.Vector2): boolean {
        return Math.round(lhs.x) == Math.round(rhs.x) && 
        Math.round(lhs.y) == Math.round(rhs.y)
    }
}