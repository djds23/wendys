import PlayerState from './Fight/PlayerState'
import * as Input from '../Inputs'

class Current {
    p1: PlayerState | null = null
    p2: PlayerState | null = null
    input: Input.InputHandler | null = null
    dummy: Input.DummyInputHandler | null = null
    gamepadEventHandler: Input.GamepadInputHandler | null = null
    keyboard: Input.KeyboardInputHandler | null = null
}

const state = new Current()
export {
    state
}