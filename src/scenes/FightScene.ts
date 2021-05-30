import Phaser from 'phaser'
import PlayerState from './Fight/PlayerState'
import * as Movement from './Movement/Movement'
import TimeUpdate from './Fight/Time'
import * as Input from './Fight/Inputs'
import Environment from '../Environment'


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
    input: Input.InputHandler | null = null
    gamepadEventHandler: Input.GamepadInputHandler | null = null
    keyboard: Input.KeyboardInputHandler | null = null
}

export default class FightScene extends Phaser.Scene {
    current: Current = new Current();
    inputTextLines = new Array<Phaser.GameObjects.Text>()
    recentMovementInputs = new Array<Movement.MovementUpdate>()
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
                this.current.gamepadEventHandler = new Input.GamepadInputHandler(pad)
                this.current.gamepadEventHandler.register((movementUpdate, time) => {
                    this.current.p1?.update(movementUpdate)
                    this.recentMovementInputs.unshift(movementUpdate)
                })
                pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (index, value, button) => {
                    if (index === 0) {
                        this.current.p1?.performAttack()
                    }
                });
            });
        } else {
            // this.current.pad = this.input.gamepad.pad1;
        }
        this.current.keyboard = new Input.KeyboardInputHandler(
            this.input.keyboard
        )
        this.current.keyboard.register((movementUpdate, time) => {
            this.current.p1?.update(movementUpdate)
            this.recentMovementInputs.unshift(movementUpdate)
        })
        this.current.keyboard.configure()
        this.current.p1.configure(this, ground)
    }

    update(time, delta) {
        this.current.gamepadEventHandler?.update(time, delta)
        this.current.keyboard?.update(time, delta)
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
