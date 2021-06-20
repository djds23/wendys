import Phaser from 'phaser'
import { update } from 'ramda'
import { Character } from '../../Character'
import * as Physics from '../../Physics'

class TextureChanges {
    textureKey: string
    animationKey: string
    // At some point, if we want to really implement rollback we need animation frame driven by these
    // diffs. Until then we are not really using this for anything
    animationFrame: number 
    constructor(
        textureKey: string,
        animationKey: string,
        animationFrame: number,
    ) {
        this.textureKey = textureKey
        this.animationKey = animationKey
        this.animationFrame = animationFrame
    }

    equals(other: TextureChanges): boolean {
        return (
            this.textureKey == other.textureKey &&
            this.animationKey == other.animationKey //&&
            // this.animationFrame == other.animationFrame
        )
    }
}

// Represents an update to the character that the player would like to make.
// A broker will negotiate what updates get commmited, and what will get ignored.
class SpriteChanges {
    position: Phaser.Math.Vector2
    angle: number
    texture: TextureChanges

    constructor(
        position: Phaser.Math.Vector2,
        angle: number,
        texture: TextureChanges
    ) {
        this.position = position
        this.angle = angle
        this.texture = texture
    }

    equals(other: SpriteChanges): boolean {
        return (
            this.texture.equals(other.texture) &&
            this.position.equals(other.position) &&
            this.angle === other.angle
        )
    }

    static ChangesFromSprite(character: Character): SpriteChanges {
        let sprite = character.sprite
        let position = new Phaser.Math.Vector2(sprite.x, sprite.y)
        let texture: TextureChanges = character.idle()
        if (sprite.anims.currentAnim != null) {
            texture = new TextureChanges(
                sprite.texture.key,
                sprite.anims.currentAnim.key,
                sprite.anims.currentFrame.index
            )            
        }
        return new SpriteChanges(
            position,
            sprite.angle,
            texture
        )
    }
}

class CharacterUpdate {
    identifier: string
    time: number
    changes: SpriteChanges
    constructor(identifier: string, time: number, changes: SpriteChanges) {
        this.identifier = identifier
        this.time = time
        this.changes = changes
    }

    equals(other: CharacterUpdate): boolean {
        return (
            this.identifier === other.identifier &&
            this.time === other.time &&
            this.changes.equals(other.changes) 
        )
    }

    static MergeChangesFromPhysics(physicsUpdates: Physics.PhysicsUpdate, character: Character): CharacterUpdate {
        let spriteChanges = SpriteChanges.ChangesFromSprite(character)
        spriteChanges.angle = physicsUpdates.angle
        spriteChanges.position.x = physicsUpdates.adjustedPosition.x
        spriteChanges.position.y = physicsUpdates.adjustedPosition.y
        return new CharacterUpdate(physicsUpdates.identifier, physicsUpdates.time, spriteChanges)
    }
}

export {
    CharacterUpdate,
    SpriteChanges,
    TextureChanges
}