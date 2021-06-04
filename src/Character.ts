import Phaser from 'phaser'
import { CharacterAsset } from "./Assets";
import * as R from 'ramda'

class Character {
    idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    run: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    attack: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
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
        this.idle = scene.physics.add.sprite(startingX, 0, characterAsset.idle.key, 0)            
        this.idle.setOrigin(0, 0)
        this.idle.setScale(3)
        this.idle.setCollideWorldBounds(true)
        this.idle.setFlipX(flipX)

        this.attack = scene.physics.add.sprite(startingX, 0, characterAsset.attack.key, 0)

        // Animation set
        scene.anims.create({
            key: "run",
            frames: scene.anims.generateFrameNumbers(characterAsset.run.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 9,
            repeat: -1,
            duration: 0.1
        });
        this.run = scene.physics.add.sprite(startingX, 0, characterAsset.run.key, 0)
        this.run.setOrigin(0, 0)
        this.run.setScale(3)
        this.run.setCollideWorldBounds(true)
        this.run.disableBody()
        this.run.setVisible(false)
        this.run.setFlipX(flipX)

        // Animation set
        scene.anims.create({
            key: "attack",
            frames: scene.anims.generateFrameNumbers(characterAsset.attack.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
            frameRate: 9,
            duration: 0.1
        });
        this.attack = scene.physics.add.sprite(startingX, 0, characterAsset.attack.key, 0)
        this.attack.setOrigin(0, 0)
        this.attack.setScale(3)
        this.attack.setCollideWorldBounds(true)
        this.attack.disableBody()
        this.attack.setVisible(false)
        this.attack.setFlipX(flipX)
    }

    sprites(): Array<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody> {
        return [
            this.idle,
            this.run,
            this.attack
        ]
    }

    isInDamageAnimation(): boolean {
        return (
            this.attack.visible &&
            R.contains(
                this.attack.anims.currentFrame.index, 
                this.asset.attack.damageFrames
            ) 
        )
    }
}

export {
    Character
}