import * as Input from "../Inputs"
import * as R from 'ramda'

class Queue<T> {
    _underlying: Array<T>
    peek(): T | null {
        return this._underlying[0]
    }

    enqueue(item: T): void {
        this._underlying.push(item)
    }

    dequeue(): T | null {
        let output = this._underlying[0]
        this._underlying = this._underlying.splice(1, this._underlying.length)
        return output
    }

    count(): number {
        return this._underlying.length
    }

    constructor(origin: Array<T>) {
        this._underlying = origin
    }
}


export default Queue