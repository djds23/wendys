import Phaser from 'phaser'
import * as R from 'ramda'
import * as Input from '../Inputs'
import * as current from './Current'
import FightScene from './Fight/FightScene'

export default class PauseScene extends Phaser.Scene {
    static key = "PauseScene"

    constructor() {
        super(PauseScene.key)
    }

    create() {
        this.events.on(Phaser.Scenes.Events.RESUME, () => {
            console.log(PauseScene.key + " RESUME Event")
            current.state.gamepadEventHandler?.configure(this)
            current.state.keyboard?.configure(this)
            this.registerInputCallbacks()
        })

        this.events.on(Phaser.Scenes.Events.PAUSE, () => {
            console.log(PauseScene.key + " PAUSE Event")
            current.state.gamepadEventHandler?.removeFromScene(this)
            current.state.keyboard?.removeFromScene(this)
        })

        current.state.gamepadEventHandler?.configure(this)
        current.state.keyboard?.configure(this)
        this.registerInputCallbacks()
    }

    update(time, delta) {
        current.state.gamepadEventHandler?.update(time, delta)
        current.state.keyboard?.update(time, delta)
    }

    registerInputCallbacks() {
        current.state.keyboard?.register((input) => this.handleInput(input))
        current.state.gamepadEventHandler?.register((input) => this.handleInput(input))
    }

    handleInput(inputUpdate: Input.InputUpdate) {
        console.log(PauseScene.key + ";" + inputUpdate.time + ";" + JSON.stringify(inputUpdate))
        if (R.contains(Input.Action.START, inputUpdate.actions)) {
            this.game.scene.pause(PauseScene.key)
            this.game.scene.resume(FightScene.key)
        }
    }
}