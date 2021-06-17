import Phaser from 'phaser'
import PlayerState from './Fight/PlayerState'
import * as Input from '../Inputs'
import FightScene from './Fight/FightScene'
import PauseScene from './PauseScene'
import Match from './Match'

class TransitionManager {
    manager: Phaser.Scenes.SceneManager | null = null
    lastUpdate: number = 0
    currentKey: string | null = null

    static transitionDebounceTimeInSeconds = (2 * 1000)
    togglePause(requestTime: number) {
        if ((this.lastUpdate + TransitionManager.transitionDebounceTimeInSeconds) > requestTime) return;
        if (this.currentKey === FightScene.key) {
            this.manager?.pause(FightScene.key)
            this.manager?.start(PauseScene.key)
            this.currentKey = PauseScene.key
        } else {
            this.manager?.pause(PauseScene.key)
            this.manager?.resume(FightScene.key)
            this.currentKey = FightScene.key
        }
        this.lastUpdate = requestTime
    }
}

class Current {
    match: Match | null = null
    p1: PlayerState | null = null
    p2: PlayerState | null = null
    input: Input.InputHandler | null = null
    transition = new TransitionManager()
    dummy: Input.DummyInputHandler | null = null
}

const state = new Current()
export {
    state
}