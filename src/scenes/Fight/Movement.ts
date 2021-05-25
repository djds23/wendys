import Phaser from 'phaser'

class MovementUpdate {
    horizontal: HorizontalMovement

    constructor(horizontal: HorizontalMovement) {
        this.horizontal = horizontal
    }
}

enum HorizontalMovement {
    LEFT, RIGHT, STATIONARY
}

export {
    HorizontalMovement,
    MovementUpdate
}