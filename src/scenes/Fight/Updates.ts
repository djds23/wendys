import Phaser from 'phaser'
import { Character } from '../../Character'

class TextureChanges {
    textureKey: string
    animationKey: string
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
            this.animationKey == other.animationKey &&
            this.animationFrame == other.animationFrame
        )
    }
}

// Represents an update to the character that the player would like to make.
// A broker will negotiate what updates get commmited, and what will get ignored.
class SpriteChanges {
    position: Phaser.Math.Vector2
    angle: number
    texture: TextureChanges | null

    constructor(
        position: Phaser.Math.Vector2,
        angle: number,
        texture: TextureChanges | null
    ) {
        this.position = position
        this.angle = angle
        this.texture = texture
    }

    equals(other: SpriteChanges): boolean {
        let areTexturesEqual = false
        if (other.texture != null) {
            areTexturesEqual = (this.texture?.equals(other.texture) || false)
        }
        return (
            areTexturesEqual &&
            this.position.equals(other.position) &&
            this.angle === other.angle
            
        )

    }

    static ChangesFromSprite(character: Character): SpriteChanges {
        let sprite = character.sprite
        let position = new Phaser.Math.Vector2(sprite.x, sprite.y)
        let texture: TextureChanges | null = null
        if (sprite.anims.currentAnim != null) {
            texture = new TextureChanges(
                sprite.texture.key,
                sprite.anims.currentAnim.key,
                sprite.anims.currentFrame.index
            )            
        } else {
            texture = character.idle()         
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
    changes: SpriteChanges | null = null
    constructor(identifier: string, time: number, changes: SpriteChanges |  null) {
        this.identifier = identifier
        this.time = time
        this.changes = changes
    }

    equals(other: CharacterUpdate): boolean {
        let areChangesEqual = false
        if (other.changes != null) {
            areChangesEqual = (this.changes?.equals(other.changes) || false)
        }
        return (
            areChangesEqual &&
            this.identifier === other.identifier,
            this.time === other.time
        )
    }
}

export {
    CharacterUpdate,
    SpriteChanges,
    TextureChanges
}