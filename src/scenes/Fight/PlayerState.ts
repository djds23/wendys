import Phaser from 'phaser'
import { MovementUpdate, HorizontalMovement } from './Movement'

export default class PlayerState {
    idle: Phaser.GameObjects.Sprite
    attack: Phaser.GameObjects.Sprite
    currentSprite: Phaser.GameObjects.Sprite

    canMove = true

    constructor(
        idle: Phaser.GameObjects.Sprite,
        attack: Phaser.GameObjects.Sprite
    ) {
        this.idle = idle
        this.attack = attack
        this.currentSprite = idle

        attack.setOrigin(0, 0)
        attack.setScale(3)
        idle.setOrigin(0, 0)
        idle.setScale(3)

        attack.setVisible(false)
        idle.play("idle")
    }

    /*
        Try call this every update
    */
    update(inputs: MovementUpdate | null) {
        if (inputs != null) {
            let xAdjustment = this.currentSprite.x
            switch (inputs.horizontal) {
                case HorizontalMovement.LEFT:
                    xAdjustment -= 3
                    break;
                case HorizontalMovement.RIGHT:
                    xAdjustment += 3
                    break;
                case HorizontalMovement.STATIONARY:
                    break;
            }
            this.currentSprite.setX(xAdjustment)
        }
    }

    performAttack() {
        this.canMove = false
        this.attack.setX(this.currentSprite.x)
        this.attack.setY(this.currentSprite.y)
        this.currentSprite?.setVisible(false)
        this.attack?.setVisible(true)
        this.currentSprite = this.attack
        this.attack?.play('attack').on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame, gameObject) => {
            this.canMove = true
            this.attack?.setVisible(false)
            this.currentSprite = this.idle
            this.currentSprite?.setVisible(true)
        });
    }
}

