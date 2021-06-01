import * as Input from "../Inputs"

class InputQueue {
    previousInput: Input.InputUpdate | null = null
    callbacks = new Array<() => void>()
    from: string
    to: string
    constructor(from: string, to: string) {
        this.from = from
        this.to = to
    }

    addInput(input: Input.InputUpdate) {
        if (this.previousInput?.action === this.from && input.action === this.to) {
            this.callbacks.forEach((callback) => callback())
        } 
        this.previousInput = input
    }

    listenForTransition(callback: () => void) {
        this.callbacks.push(callback)
    }
}

export default InputQueue