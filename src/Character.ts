import Phaser from 'phaser'
import { CharacterAsset } from "./Assets";
import * as R from 'ramda'

class Character {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    asset: CharacterAsset
    constructor(
        characterAsset: CharacterAsset,
        scene: Phaser.Scene,
        startingX: number,
        flipX: boolean
        ) {
        this.asset = characterAsset

        // Animation set
        scene.anims.create({
            key: "idle",
            frames: scene.anims.generateFrameNumbers(characterAsset.idle.key, { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 8,
            repeat: -1,
            duration: 2
        });
        this.sprite = scene.physics.add.sprite(startingX, 0, characterAsset.idle.key, 0)            
        this.sprite.setOrigin(0, 0)
        this.sprite.setScale(3)
        this.sprite.setCollideWorldBounds(true)
        this.sprite.setFlipX(flipX)

        // Animation set
        scene.anims.create({
            key: "run",
            frames: scene.anims.generateFrameNumbers(characterAsset.run.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 9,
            repeat: -1,
            duration: 0.1
        });

        // Animation set
        scene.anims.create({
            key: "attack",
            frames: scene.anims.generateFrameNumbers(characterAsset.attack.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
            frameRate: 9,
            duration: 0.1
        });
    }

    idle() {
        this.sprite.setTexture(this.asset.idle.key).play("idle")
    }

    run() {
        this.sprite.setTexture(this.asset.run.key, 2).play("run")
    }

    attack() {
        this.sprite.setTexture(this.asset.attack.key).play("attack")
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
            this.sprite.texture.key === this.asset.attack
        )
    }
}

export {
    Character
}