class MovementUpdate {
    // direction you are moving
    horizontal: HorizontalMovement
    
    // direction you are facing
    facing: HorizontalMovement
    constructor(
        horizontal: HorizontalMovement,
        facing: HorizontalMovement
        ) {
        this.horizontal = horizontal
        this.facing = facing
    }

    isFacingOpponent(): boolean {
        return this.horizontal == this.facing
    }
}

enum HorizontalMovement {
    LEFT, RIGHT, STATIONARY
}

export {
    HorizontalMovement,
    MovementUpdate
}