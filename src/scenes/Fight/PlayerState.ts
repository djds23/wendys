import Phaser from 'phaser'
import { HorizontalMovement, VerticalMovement } from '../Movement/Movement'
import * as Input from '../../Inputs'
import FightScene from './FightScene'
import PauseScene from '../PauseScene'
import * as R from 'ramda'
import { Character } from '~/Character'

export default class PlayerState {
    character: Character
    currentSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    scene: Phaser.Scene
    isJumping = false
    constructor(
        character: Character,
        scene: Phaser.Scene
    ) {
        this.scene = scene
        this.character = character
        this.currentSprite = character.idle
        this.character.idle.play("idle")
    }

    // Call in create to finish configuring object
    configure(
        ground: Phaser.Types.Physics.Arcade.ImageWithStaticBody, 
        otherSprites: Array<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>
        ) {
        this.character.attack.body.setAllowRotation(false)
        this.scene.physics.add.collider(this.character.attack, ground, (_obj1, _obj2) => { 
            this.character.attack.setVelocity(0, 0)
        })
        
        this.character.idle.body.setAllowRotation(false)
        this.scene.physics.add.collider(this.character.idle, ground, (_obj1, _obj2) => { 
            this.character.idle.setVelocity(0, 0)
        })

        this.character.run.body.setAllowRotation(false)
        this.scene.physics.add.collider(this.character.run, ground, (_obj1, _obj2) => { 
            this.character.run.setVelocity(0, 0)
        })
    }
    /*
        Try call this every update
    */
    update(inputs: Input.InputUpdate | null) {
        if (this.currentSprite.body.touching.down) {
            this.isJumping = false
        }

        if (inputs != null && this.isAttacking() == false) {
            let xAdjustment = this.currentSprite.x
            if (inputs.veritcal === VerticalMovement.JUMP && this.isJumping === false) {
                this.isJumping = true
                this.currentSprite.setVelocity(
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
                this.currentSprite.setX(xAdjustment)
            }

            if (R.contains(Input.Action.ATTACK, inputs.actions)) {
                this.performAttack()
            } else if (R.contains(Input.Action.START, inputs.actions)) {
                this.requestPause()
            }
        } else {
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
        if (this.isRunning()) return;
        this.currentSprite?.setVisible(false)        
        this.character.run.enableBody(true, this.currentSprite.x, this.currentSprite.y, true, true);
        this.currentSprite?.body.reset(this.currentSprite.x, this.currentSprite.y)
        this.currentSprite = this.character.run
        this.currentSprite.play("run")
        this.currentSprite.setVisible(true)
    }
    

    swapToIdleAnimationIfNeeded() {
        if (this.isIdle()) return;
        this.currentSprite?.setVisible(false)        
        this.character.idle.enableBody(true, this.currentSprite.x, this.currentSprite.y, true, true);
        this.currentSprite?.body.reset(this.currentSprite.x, this.currentSprite.y)
        this.currentSprite = this.character.idle
        this.currentSprite.play("idle")
        this.currentSprite.setVisible(true)
    }

    performAttack() {
        if (this.isAttacking()) return;
        this.currentSprite?.setVisible(false)        
        this.character.attack.enableBody(true, this.currentSprite.x, this.currentSprite.y, true, true);
        this.currentSprite?.body.reset(this.currentSprite.x, this.currentSprite.y)
        this.currentSprite = this.character.attack
        this.character.attack?.play('attack').on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame, gameObject) => {
            this.character.attack.disableBody(true, true)
            this.currentSprite = this.character.idle
            this.currentSprite?.setVisible(true)
        });
    }

    requestPause() {
        let manager = this.scene.game.scene
        if (manager.isPaused(FightScene.key) == false) {
            manager.pause(FightScene.key)
            manager.start(PauseScene.key)
        }
    }

    isAttacking(): boolean {
        return this.character.attack.visible
    }

    isRunning(): boolean {
        return this.character.run.visible
    }

    isIdle(): boolean {
        return this.character.idle.visible
    }
}