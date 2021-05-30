import { Vertices } from 'matter'
import Phaser, { Physics } from 'phaser'
import { MovementUpdate, HorizontalMovement, VerticalMovement } from '../Movement/Movement'
import TimeUpdate from './Time'

export default class PlayerState {
    idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    attack: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    currentSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    isJumping = false
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

    // Call in create to finish configuring object
    configure(scene: Phaser.Scene, ground: Phaser.Types.Physics.Arcade.ImageWithStaticBody) {
        scene.physics.add.collider(this.attack, ground)
        scene.physics.add.collider(this.idle, ground)
    }
    /*
        Try call this every update
    */
    update(inputs: MovementUpdate | null) {
        if (inputs != null && this.isAttacking() == false) {
            let xAdjustment = this.currentSprite.x
            if (this.isJumping) {
                if (this.currentSprite.body.touching.down) {
                    this.isJumping = false
                    this.currentSprite.setVelocity(0, 0)
                }
            } else if (inputs.veritcal == VerticalMovement.JUMP) {
                // console.log(inputs)
                this.isJumping = true
                this.currentSprite.setVelocity(
                    this.horizontalMovementToJumpVelocity(inputs.horizontal),
                    -1000
                )
            } else if (this.isJumping == false) {
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
    }

    horizontalMovementToJumpVelocity(movement: HorizontalMovement): number {
        switch (movement) {
            case HorizontalMovement.LEFT:
                return -300
            case HorizontalMovement.RIGHT:
                return 300
            case HorizontalMovement.STATIONARY:
                return 0
        }
    }

    performAttack() {
        if (this.isAttacking()) return;
        this.currentSprite?.setVisible(false)
        this.attack.enableBody(true, this.currentSprite.x, this.currentSprite.y, true, true);
        this.currentSprite = this.attack
        this.attack?.play('attack').on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame, gameObject) => {
            this.attack.disableBody(true, true)
            this.currentSprite = this.idle
            this.currentSprite?.setVisible(true)
        });
    }

    isAttacking(): boolean {
        return this.attack.visible
    }
}