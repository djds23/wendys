import Phaser from 'phaser'
import * as PlayerState from './Fight/PlayerState'
import * as Input from '../Inputs'
import FightScene from './Fight/FightScene'
import PauseScene from './PauseScene'
import Match from './Match'
import { Character } from '~/Character'

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
    p1: PlayerState.PlayerState | null = null
    p2: PlayerState.PlayerState | null = null
    input: Input.InputHandler | null = null
    transition = new TransitionManager()
    dummy: Input.DummyInputHandler | null = null

    characters(): Map<string, Character> {
        let map = new Map()
        map.set(this.p1!.character.identifier(), this.p1!.character)
        map.set(this.p2!.character.identifier(), this.p2!.character)
        return map
    }
}

const state = new Current()
export {
    state
}