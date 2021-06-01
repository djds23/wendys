import Phaser from 'phaser'
import * as current from './Current'

export default class PauseScene extends Phaser.Scene {
    static key = "PauseScene"
    constructor() {
        super(PauseScene.key)
    }

    create() {
        current.state.gamepadEventHandler?.configure(this)
        current.state.keyboard?.configure(this)
    }
    update(time, delta) {
        current.state.gamepadEventHandler?.update(time, delta)
        current.state.keyboard?.update(time, delta)
    }
}