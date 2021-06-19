import Phaser from 'phaser'
import { uniq } from 'ramda';
import { CharacterAsset, CharacterSelect } from "./Assets";
import * as Changes  from './scenes/Fight/Updates'

class Character {
    sprite: Phaser.GameObjects.Sprite
    asset: CharacterAsset

    identifier(): string {
        return this.sprite.data.values.id
    }

    constructor(
        characterAsset: CharacterAsset,
        scene: Phaser.Scene,
        startingX: number,
        flipX: boolean,
        identifier: string
        ) {
        this.asset = characterAsset

        this.sprite = scene.add.sprite(startingX, 100, characterAsset.idle.key, 0)
        this.sprite.setScale(3)
        this.sprite.setFlipX(flipX)
        this.sprite.setDataEnabled()
        this.sprite.setData({ id: identifier })

        // Animation set
        this.sprite.anims.create({
            key: "idle",
            frames: scene.anims.generateFrameNumbers(characterAsset.idle.key, { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 8,
            repeat: -1,
            duration: 2
        })

        // Animation set
        this.sprite.anims.create({
            key: "run",
            frames: scene.anims.generateFrameNumbers(characterAsset.run.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 9,
            repeat: -1,
            duration: 0.1
        });

        // Animation set
        this.sprite.anims.create({
            key: "attack",
            frames: scene.anims.generateFrameNumbers(characterAsset.attack.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
            frameRate: 9,
            duration: 0.1
        });
    }

    idle(): Changes.TextureChanges {
        return new Changes.TextureChanges(
            this.asset.idle.key, 
            "idle",
            0
        )
    }

    run(): Changes.TextureChanges {
        return new Changes.TextureChanges(
            this.asset.run.key, 
            "run",
            0
        )
    }

    attack(): Changes.TextureChanges {
        return new Changes.TextureChanges(
            this.asset.attack.key, 
            "attack",
            0
        )
    }

    isAttacking(): boolean {
        return (
            this.asset.attack.key === this.sprite.texture.key &&
            this.sprite.anims.currentFrame.isLast === false
        )
    }

    isRunning(): boolean {
        return this.asset.run.key === this.sprite.texture.key
    }

    isIdle(): boolean {
        return this.asset.idle.key === this.sprite.texture.key
    }

    isInDamageAnimation(): boolean {
        return (
            this.sprite.texture.key === this.asset.attack.key
        )
    }
}

export {
    Character
}