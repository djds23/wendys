class MovementUpdate {
    // direction you are moving
    horizontal: HorizontalMovement
    veritcal: VerticalMovement


    // direction you are facing
    facing: HorizontalMovement
    constructor(
        horizontal: HorizontalMovement,
        veritcal: VerticalMovement,
        facing: HorizontalMovement
        ) {
        this.horizontal = horizontal
        this.veritcal = veritcal
        this.facing = facing
    }

    isFacingOpponent(): boolean {
        return this.horizontal == this.facing
    }
}

enum HorizontalMovement {
    LEFT, RIGHT, STATIONARY
}

enum VerticalMovement {
    JUMP, STATIONARY
}

export {
    HorizontalMovement,
    VerticalMovement,
    MovementUpdate
}