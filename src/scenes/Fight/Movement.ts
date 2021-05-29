class MovementUpdate {
    // direction you are moving
    horizontal: HorizontalMovement
    veritcal: VerticalMovement
    style: MovementStyle


    // direction you are facing
    facing: HorizontalMovement
    constructor(
        horizontal: HorizontalMovement,
        veritcal: VerticalMovement,
        facing: HorizontalMovement,
        style: MovementStyle
        ) {
        this.horizontal = horizontal
        this.veritcal = veritcal
        this.facing = facing
        this.style = style
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

enum MovementStyle {
    RUN, DASH, STATIONARY

}

export {
    HorizontalMovement,
    VerticalMovement,
    MovementStyle,
    MovementUpdate
}