import Phaser from 'phaser'
import { HorizontalMovement, VerticalMovement } from '../Movement/Movement'
import * as Input from '../../Inputs'
import * as R from 'ramda'
import { Character } from '../../Character'
import * as Changes  from './Updates'


class PlayerState {
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

    identifier(): string {
        return this.character.identifier()
    }


    // call this every update
    update(inputs: Input.InputUpdate | null, time: number, delta: number): Changes.CharacterUpdate {
        if (this.character.sprite.x > 570) {
            // this.isJumping = false
        }

        let output = new Changes.CharacterUpdate(this.character.identifier(), time, null)
        output.changes = Changes.SpriteChanges.ChangesFromSprite(this.character)
        output.changes.texture = this.character.idle()

        if (inputs != null && this.character.isAttacking() == false) {
            if (inputs.veritcal === VerticalMovement.JUMP && this.isJumping === false) {
                // this.isJumping = true
                return output
            } else if (this.isJumping === false) {
                switch (inputs.horizontal) {
                    case HorizontalMovement.LEFT:
                        output.changes.position.x -= 1.2
                        output.changes.texture = this.character.run()
                        break;
                    case HorizontalMovement.RIGHT:
                        output.changes.position.x += 1.2
                        output.changes.texture = this.character.run()
                        break;
                    case HorizontalMovement.STATIONARY:
                        break;
                }
                return output
            }

            if (R.contains(Input.Action.ATTACK, inputs.actions)) {
                output.changes.texture = this.character.attack()
                return output
            }
        } 
        return output
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

    attackGeometry(): Phaser.Geom.Rectangle | null {
        if (this.character.isInDamageAnimation()) {
            // gets the actual bounds of the sprite when attacking
            return this.character.sprite.getBounds()
        } else {
            return null
        }
    }
}

export {
    PlayerState
}