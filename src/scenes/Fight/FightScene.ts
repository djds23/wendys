import Phaser from 'phaser'
import PlayerState from './PlayerState'
import * as Input from '../../Inputs'
import * as current from '../Current'
import Environment from '../../Environment'
import { BlueWitch, Stage } from '~/Assets'
import { Character } from '~/Character'


export default class FightScene extends Phaser.Scene {
    static key: string = 'FightScene'
    inputTextLines = new Array<Phaser.GameObjects.Text>()
    recentMovementInputs = new Array<Input.InputUpdate>()
    blueWitch = new BlueWitch()
    constructor() {
        super(FightScene.key)
    }

    preload() {
        this.load.setBaseURL(Environment.baseURL)

        this.load.image(Stage.ground.key, Stage.ground.path)
        this.load.spritesheet(this.blueWitch.attack.key, this.blueWitch.attack.path, this.blueWitch.attack.frameConfig)
        this.load.spritesheet(this.blueWitch.run.key, this.blueWitch.run.path, this.blueWitch.run.frameConfig)
        this.load.spritesheet(this.blueWitch.idle.key, this.blueWitch.idle.path, this.blueWitch.idle.frameConfig)
    }

    create() {
        this.inputTextLines = []
        this.recentMovementInputs = []

        this.addInputText()
        let ground = this.physics.add.staticImage(400, 576, Stage.ground.key)

        current.state.p1 = new PlayerState(
            new Character(this.blueWitch, this, 0, false),
            this
        )

        current.state.p2 = new PlayerState(
            new Character(this.blueWitch, this, 700, true),
            this
        )

        current.state.input = new Input.KeyboardInputHandler()
        current.state.input.configure(this)

        current.state.p1.configure(ground, [])
        current.state.p2.configure(ground, [])

        this.events.on(Phaser.Scenes.Events.RESUME, () => {
            current.state.gamepadEventHandler?.configure(this)
            current.state.keyboard?.configure(this)
        })

        this.events.on(Phaser.Scenes.Events.PAUSE, () => {
            current.state.gamepadEventHandler?.removeFromScene(this)
            current.state.keyboard?.removeFromScene(this)
        })
    }

    update(time, delta) {
        if (current.state.input != null) {
            let inputUpdate = current.state.input.update(time, delta)
            current.state.p1?.update(        
                inputUpdate
            )
            current.state.p1?.update(inputUpdate)

            if (inputUpdate != null) {
                // console.log(FightScene.key + ";" + inputUpdate.time + ";" + JSON.stringify(inputUpdate))
                this.recentMovementInputs.unshift()
                this.updateInputText()
            }
        } else {
            current.state.p1?.update(null)
        }
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
