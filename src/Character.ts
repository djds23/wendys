import Phaser from 'phaser'
import { CharacterAsset } from "./Assets";

class Character {
    idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    attack: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    attackAnim: Phaser.Animations.Animation | boolean
    constructor(
        characterAsset: CharacterAsset,
        scene: Phaser.Scene,
        startingX: number
        ) {
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

        // Animation set
        this.attackAnim = scene.anims.create({
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
    }

    sprites(): Array<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody> {
        return [
            this.idle,
            this.attack
        ]
    }

    isInAttackAnimation(): boolean {
        if ((typeof this.attackAnim) === 'boolean') {
            throw new CharacterError("Attack animation not registered")
        } else if (this.attackAnim instanceof Phaser.Animations.Animation) {
            this.attackAnim
        }
    }
}

class CharacterError extends Error {
    constructor(message) {
        super(message)
        this.name = 'CharacterError'
    }
}

export {
    Character
}