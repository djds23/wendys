import PlayerState from './Fight/PlayerState'
import * as Input from './Fight/Inputs'

class Current {
    p1: PlayerState | null = null
    input: Input.InputHandler | null = null
    dummy: Input.DummyInputHandler | null = null
    gamepadEventHandler: Input.GamepadInputHandler | null = null
    keyboard: Input.KeyboardInputHandler | null = null
}
const state = new Current()
export {
    state
}