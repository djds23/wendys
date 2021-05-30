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
    LEFT="LEFT", RIGHT="RIGHT", STATIONARY="STATIONARY-H"
}

enum VerticalMovement {
    JUMP="JUMP", STATIONARY="STATIONARY-V"
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