import Phaser from 'phaser'
import * as PlayerState from './PlayerState'
import * as Input from '../../Inputs'
import * as current from '../Current'
import Environment from '../../Environment'
import { CharacterAsset, Stage } from '~/Assets'
import { Character } from '~/Character'
import * as Physics from '../../Physics'
import * as R from 'ramda'
import * as planck from 'planck'
import * as Changes  from './Updates'


export default class FightScene extends Phaser.Scene {
    static key: string = 'FightScene'
    inputTextLines = new Array<Phaser.GameObjects.Text>()
    recentMovementInputs = new Array<Input.InputUpdate>()
    simulation = new Physics.Physics()
    constructor() {
        super(FightScene.key)
    }

    preload() {
        this.load.setBaseURL(Environment.baseURL)
        this.load.image(Stage.ground.key, Stage.ground.path)
        this.preloadSprites(current.state.match!.character1)
        this.preloadSprites(current.state.match!.character2)
    }

    preloadSprites(character: CharacterAsset) {
        this.load.spritesheet(character.attack.key, character.attack.path, character.attack.frameConfig)
        this.load.spritesheet(character.run.key, character.run.path, character.run.frameConfig)
        this.load.spritesheet(character.idle.key, character.idle.path, character.idle.frameConfig)
    }
    create() {
        this.inputTextLines = []
        this.recentMovementInputs = []

        this.addInputText()
        let ground = this.add.image(400, 576, Stage.ground.key)
        this.simulation.createBox(ground.x, ground.y, ground.width, ground.height, false, "ground", null)

        let player1ID = "player1"
        current.state.p1 = new PlayerState.PlayerState(
            new Character(current.state.match!.character1, this, 50, false, player1ID),
            this
        )
        let sprite1 = current.state.p1.character.sprite
        this.simulation.createBox(sprite1.x, sprite1.y, 30, 70, true, player1ID, (box) => {
            sprite1.data.values.body = box
        })

        let player2ID = "player2"
        current.state.p2 = new PlayerState.PlayerState(
            new Character(current.state.match!.character2, this, 750, true, player2ID),
            this
        )
        let sprite2 = current.state.p2.character.sprite
        this.simulation.createBox(sprite2.x, sprite2.y, 30, 70, true, player2ID, (box) => {
            sprite2.data.values.body = box
        })

        current.state.transition.manager = this.game.scene
        current.state.transition.currentKey = this.scene.key

        current.state.input = new Input.KeyboardInputHandler()
        current.state.input.configure(this)

        this.events.on(Phaser.Scenes.Events.RESUME, () => {
            current.state.input?.configure(this)
        })

        this.events.on(Phaser.Scenes.Events.PAUSE, () => {
            current.state.input?.removeFromScene(this)
        })
    }

    update(time, delta) {
        let physicsUpdates = this.simulation.update(time, delta)
        let characterUpdates: Array<Changes.CharacterUpdate> = [] 

        if (current.state.input != null) {
            let inputUpdate = current.state.input.update(time, delta)
            if (inputUpdate != null) {
                this.recentMovementInputs.unshift(inputUpdate)
                this.updateInputText()

                if (R.contains(Input.Action.START, inputUpdate.actions)) {
                    current.state.transition.togglePause(time)
                }
            }
            let newCharacterUpdate = current.state.p1!.update(inputUpdate, time, delta)
            if (newCharacterUpdate != null) {
                characterUpdates.push(newCharacterUpdate)
            }
            current.state.p2?.update(inputUpdate, time, delta)
        } else {
            current.state.p1?.update(null, time, delta)
        }


        /// TODO neogtiate updates between Planck and user input.
        ///
        /// if the physics has changed the position of the character then 
        ///     update the position of the character
        ///
        /// if the user updated their position, but the physics hasn't changed then
        ///     update the position of the character and the body
        ///     apply the animation requested by the character 
        ///
        /// if one system takes the update, then the other one shouldn't
        ///
        /// also this should be really fucking fast
        let beforeChangeCache = new Map<string, Changes.SpriteChanges>()
        let characters = current.state.characters()

        characterUpdates.forEach((update) => {
            let character = characters.get(update.identifier)
            if (character == null) return;
            let beforeChange = Changes.SpriteChanges.ChangesFromSprite(character)
            beforeChangeCache.set(character.identifier, beforeChange)
            let changesApplied = this.applyChangesToCharacter(character, update, beforeChange)
            if (changesApplied) {
                console.log(character.identifier + " inputUpdated" + changesApplied)
                this.updatePhysicsBodyToSprite(character.sprite)
                characters.delete(update.identifier)
            }
        })

        physicsUpdates.forEach((update) => {    
            let character = characters.get(update.identifier)
            // Physics has moved this sprite
            if (character == null) return;
            let beforeChange = beforeChangeCache.get(character.identifier)
            if (beforeChange == null) {
                beforeChange = Changes.SpriteChanges.ChangesFromSprite(character)
            }
            let mergedUpdate = Changes.CharacterUpdate.MergeChangesFromPhysics(update, character)
            let changesApplied = this.applyChangesToCharacter(character, mergedUpdate, beforeChange)
            if (changesApplied) {
                console.log(character.identifier + " physicsUpdated" + character.sprite.data.values.body.getPosition())
                characters.delete(update.identifier)
            }
        })
    }

    // Apply updates to a character if any exist
    // return true if the update was performed. Will only perform the update if the
    // character is not in the correct state.
    applyChangesToCharacter(character: Character, update: Changes.CharacterUpdate, before: Changes.SpriteChanges): boolean {
        if (update.changes == null) {
            return false
        }
        let sprite = character.sprite
        let inputHasChangedForCharacter = before.equals(update.changes)
        if (inputHasChangedForCharacter == false || character.sprite.anims.currentAnim == null) {
            sprite.setPosition(update.changes?.position.x, update.changes?.position.y)
            sprite.setRotation(update.changes?.angle)

            if (update.changes?.texture?.textureKey != null && sprite.texture.key !== update.changes?.texture.textureKey) {
                sprite.setTexture(update.changes.texture.textureKey)
            }

            if (update.changes?.texture?.animationKey != null && sprite.anims.currentAnim?.key !== update.changes?.texture.animationKey) {
                sprite.play(update.changes.texture.animationKey)
            }
            
            return true
        } else {
            return false
        }
    }

    updatePhysicsBodyToSprite(sprite: Phaser.GameObjects.Sprite) {
        let vec = new planck.Vec2()
        vec.set(sprite.x, sprite.y)
        let body = sprite?.data.values.body as planck.Body
        console.log("updatePhysicsBodyToSprite x: " + sprite.x + " y: " + sprite.y + " physics " + vec)
        body.setPosition(vec)
    }

    addInputText() {
        for (let y=20; y <= 240; y+=20) {
            this.inputTextLines.push(
                this.add.text(20, y, "")
            )
        }
    }

    updateInputText() {
        this.recentMovementInputs = this.recentMovementInputs.slice(0, 14)
        this.inputTextLines.forEach((object, index) => {
            let movement = this.recentMovementInputs[index]
            object.text = JSON.stringify(movement) 
        })
    }
}
