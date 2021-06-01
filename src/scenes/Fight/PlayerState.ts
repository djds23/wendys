import { Vertices } from 'matter'
import Phaser, { Physics } from 'phaser'
import { HorizontalMovement, VerticalMovement } from '../Movement/Movement'
import TimeUpdate from './Time'
import * as Input from '../../Inputs'
import FightScene from '../FightScene'
import PauseScene from '../PauseScene'

export default class PlayerState {
    idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    attack: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    currentSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    scene: Phaser.Scene
    isJumping = false
    constructor(
        idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        attack: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        scene: Phaser.Scene
    ) {
        this.scene = scene
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
    configure(ground: Phaser.Types.Physics.Arcade.ImageWithStaticBody) {
        this.attack.body.setAllowRotation(false)
        this.scene.physics.add.collider(this.attack, ground, (_obj1, _obj2) => { 
            this.isJumping = false
            this.attack.setVelocity(0, 0)
        })
        
        this.idle.body.setAllowRotation(false)
        this.scene.physics.add.collider(this.idle, ground, (_obj1, _obj2) => { 
            this.isJumping = false
            this.idle.setVelocity(0, 0)
        })
    }
    /*
        Try call this every update
    */
    update(inputs: Input.InputUpdate | null) {
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
                        break;
                    case HorizontalMovement.RIGHT:
                        xAdjustment += 3
                        break;
                    case HorizontalMovement.STATIONARY:
                        break;
                }
                this.currentSprite.setX(xAdjustment)
            }

            if (inputs.action === Input.Action.ATTACK) {
                this.performAttack()
            } else if (inputs.action === Input.Action.START) {
                this.requestPause()
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
        this.currentSprite?.body.reset(this.currentSprite.x, this.currentSprite.y)
        this.currentSprite = this.attack
        this.attack?.play('attack').on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame, gameObject) => {
            this.attack.disableBody(true, true)
            this.currentSprite = this.idle
            this.currentSprite?.setVisible(true)
        });
    }

    requestPause() {
        console.log('request pause')
        let manager = this.scene.game.scene
        if (manager.isPaused(FightScene.key)) {
            console.log('starting')
            manager.pause(PauseScene.key)
            manager.resume(FightScene.key)
        } else {
            console.log('pausing')
            manager.pause(FightScene.key)
            manager.start(PauseScene.key)
        }
    }

    isAttacking(): boolean {
        return this.attack.visible
    }
}