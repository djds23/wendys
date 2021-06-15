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
            current.state.input?.configure(this)
        })

        this.events.on(Phaser.Scenes.Events.PAUSE, () => {
            current.state.input?.removeFromScene(this)
        })
        current.state.input?.configure(this)
    }

    update(time, delta) {
        if (current.state.input != null) {
            let inputUpdate = current.state.input.update(time, delta)
            if (inputUpdate != null && R.contains(Input.Action.START, inputUpdate.actions)) {
                current.state.transition.togglePause(time)
            }
        }
    }
}