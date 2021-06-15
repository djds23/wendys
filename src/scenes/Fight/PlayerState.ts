import Phaser from 'phaser'
import { HorizontalMovement, VerticalMovement } from '../Movement/Movement'
import * as Input from '../../Inputs'
import FightScene from './FightScene'
import PauseScene from '../PauseScene'
import * as R from 'ramda'
import { Character } from '~/Character'

export default class PlayerState {
    character: Character
    scene: Phaser.Scene
    isJumping = false
    constructor(
        character: Character,
        scene: Phaser.Scene
    ) {
        this.scene = scene
        this.character = character
        this.character.idle()
    }

    // Call in create to finish configuring object
    configure(
        ground: Phaser.Types.Physics.Arcade.ImageWithStaticBody, 
        otherSprites: Array<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>
        ) {
        this.character.sprite.body.setAllowRotation(false)
        this.scene.physics.add.collider(this.character.sprite, ground, (_obj1, _obj2) => { 
            this.character.sprite.setVelocity(0, 0)
        })
    }
    /*
        Try call this every update
    */
    update(inputs: Input.InputUpdate | null) {
        if (this.character.sprite.body.touching.down) {
            this.isJumping = false
        }

        if (inputs != null && this.character.isAttacking() == false) {
            let xAdjustment = this.character.sprite.x
            if (inputs.veritcal === VerticalMovement.JUMP && this.isJumping === false) {
                this.isJumping = true
                this.character.sprite.setVelocity(
                    this.horizontalMovementToJumpVelocity(inputs.horizontal),
                    -1000
                )
            } else if (this.isJumping === false) {
                switch (inputs.horizontal) {
                    case HorizontalMovement.LEFT:
                        xAdjustment -= 3
                        this.swapToRunAnimationIfNeeded()
                        break;
                    case HorizontalMovement.RIGHT:
                        xAdjustment += 3
                        this.swapToRunAnimationIfNeeded()
                        break;
                    case HorizontalMovement.STATIONARY:
                        this.swapToIdleAnimationIfNeeded()
                        break;
                }
                this.character.sprite.setX(xAdjustment)
            }

            if (R.contains(Input.Action.ATTACK, inputs.actions)) {
                this.performAttack()
            } else if (R.contains(Input.Action.START, inputs.actions)) {
                this.requestPause()
            }
        } else if (this.character.isAttacking() === false) {
            this.swapToIdleAnimationIfNeeded()
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

    swapToRunAnimationIfNeeded() {
        if (this.character.isRunning()) return;
        this.character.run()
    }
    

    swapToIdleAnimationIfNeeded() {
        if (this.character.isIdle()) return;
        this.character.idle()
    }

    performAttack() {
        if (this.character.isAttacking()) return;
        this.character.attack()
    }

    requestPause() {
        let manager = this.scene.game.scene
        if (manager.isPaused(FightScene.key) == false) {
            manager.pause(FightScene.key)
            manager.start(PauseScene.key)
        }
    }
}