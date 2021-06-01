class MovementUpdate {
    // direction you are moving
    horizontal: HorizontalMovement
    veritcal: VerticalMovement

    // direction you are facing
    constructor(
        horizontal: HorizontalMovement,
        veritcal: VerticalMovement
        ) {
        this.horizontal = horizontal
        this.veritcal = veritcal
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