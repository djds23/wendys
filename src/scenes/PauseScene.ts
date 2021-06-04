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
            // console.log(PauseScene.key + " RESUME Event")
            current.state.gamepadEventHandler?.configure(this)
            current.state.keyboard?.configure(this)
        })

        this.events.on(Phaser.Scenes.Events.PAUSE, () => {
            // console.log(PauseScene.key + " PAUSE Event")
            current.state.gamepadEventHandler?.removeFromScene(this)
            current.state.keyboard?.removeFromScene(this)
        })

        current.state.gamepadEventHandler?.configure(this)
        current.state.keyboard?.configure(this)
    }

    update(time, delta) {
        if (current.state.input != null) {
            let inputUpdate = current.state.input.update(time, delta)
            if (inputUpdate != null && R.contains(Input.Action.START, inputUpdate.actions)) {
                this.game.scene.pause(PauseScene.key)
                this.game.scene.resume(FightScene.key)
            }
        }
    }
}