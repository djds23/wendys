import Phaser from 'phaser'
import PlayerState from './PlayerState'
import * as Input from '../../Inputs'
import * as current from '../Current'
import Environment from '../../Environment'


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


export default class FightScene extends Phaser.Scene {
    static key: string = 'FightScene'
    inputTextLines = new Array<Phaser.GameObjects.Text>()
    recentMovementInputs = new Array<Input.InputUpdate>()
    constructor() {
        super(FightScene.key)
    }

    preload() {
        this.load.setBaseURL(Environment.baseURL)

        this.load.image(Stage.ground.key, Stage.ground.path)
        this.load.spritesheet(BlueWitch.attack.key, BlueWitch.attack.path, BlueWitch.attack.frameConfig)
        this.load.spritesheet(BlueWitch.idle.key, BlueWitch.idle.path, BlueWitch.idle.frameConfig)
    }

    create() {
        this.inputTextLines = []
        this.recentMovementInputs = []

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
        current.state.p1 = new PlayerState(
            idle,
            attack,
            this
        )

        current.state.gamepadEventHandler = new Input.GamepadInputHandler()
        current.state.gamepadEventHandler?.configure(this)

        current.state.keyboard = new Input.KeyboardInputHandler()
        current.state.keyboard.configure(this)
        current.state.p1.configure(ground)
        this.registerInputCallbacks()

        this.events.on(Phaser.Scenes.Events.RESUME, () => {
            current.state.gamepadEventHandler?.configure(this)
            current.state.keyboard?.configure(this)
            this.registerInputCallbacks()
        })

        this.events.on(Phaser.Scenes.Events.PAUSE, () => {
            current.state.gamepadEventHandler?.removeFromScene(this)
            current.state.keyboard?.removeFromScene(this)
        })
    }

    registerInputCallbacks() {
        current.state.keyboard?.register((input) => this.handleInput(input))
        current.state.gamepadEventHandler?.register((input) => this.handleInput(input))
    }

    handleInput(inputUpdate: Input.InputUpdate) {
        console.log(FightScene.key + ";" + inputUpdate.time + ";" + JSON.stringify(inputUpdate))
        current.state.p1?.update(inputUpdate)
        this.recentMovementInputs.unshift(inputUpdate)
        this.updateInputText()
    }

    update(time, delta) {
        current.state.gamepadEventHandler?.update(time, delta)
        current.state.keyboard?.update(time, delta)
        // this.current.dummy?.update(time, delta)
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
