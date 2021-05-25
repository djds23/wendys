import Phaser from 'phaser'
import { MovementUpdate, HorizontalMovement } from './Movement'
import TimeUpdate from './Time'

export default class PlayerState {
    idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    attack: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    currentSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    isAttacking = false

    constructor(
        idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        attack: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    ) {
        this.idle = idle
        this.attack = attack
        this.currentSprite = idle

        attack.setOrigin(0, 0)
        attack.setScale(3)
        attack.setCollideWorldBounds(true)
        attack.disableBody()
    
        idle.setOrigin(0, 0)
        idle.setScale(3)
        idle.setCollideWorldBounds(true)


        attack.setVisible(false)
        idle.play("idle")
    }

    /*
        Try call this every update
    */
    update(inputs: MovementUpdate | null, time: TimeUpdate) {
        if (inputs != null && this.isAttacking == false) {
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
        if (this.isAttacking) return;
        this.isAttacking = true
        this.currentSprite?.setVisible(false)
        this.attack.enableBody(true, this.currentSprite.x, this.currentSprite.y, true, true);
        this.currentSprite = this.attack
        this.attack?.play('attack').on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame, gameObject) => {
            this.isAttacking = false
            this.attack.disableBody(true, true)
            this.currentSprite = this.idle
            this.currentSprite?.setVisible(true)
        });
    }
}

