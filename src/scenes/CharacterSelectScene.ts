import Phaser from 'phaser'
import * as Input from '../Inputs'
import * as R from 'ramda'
import * as current from './Current'
import { BlueWitch, RedWitch, WhiteWitch, CharacterSelect, CharacterAsset } from '../Assets'
import * as Movement from './Movement/Movement'
import Match from './Match'
import FightScene from './Fight/FightScene'

export default class CharacterSelectScene extends Phaser.Scene {
    static key = "CharacterSelectScene"

    characters = [
        new BlueWitch(),
        new RedWitch(),
        new WhiteWitch()
    ]
    characterSprites: Array<Phaser.GameObjects.Sprite> = []

    playerOne: CharacterAsset | null = null
    playerTwo: CharacterAsset | null = null
    wand: Phaser.GameObjects.Sprite | null = null
    currentIndex = 0

    offsetForIndex = [
        100, 300, 500
    ]

    inputReducer = new InputReducer()

    constructor() {
        super(CharacterSelectScene.key)
    }

    preload() {
        this.load.spritesheet(
            CharacterSelect.wand.key, 
            CharacterSelect.wand.path, 
            CharacterSelect.wand.frameConfig
        )

        this.characters.forEach((character) => {
            this.load.spritesheet(character.select.key, character.select.path, character.select.frameConfig)
        })
    }

    create() {
        this.events.on(Phaser.Scenes.Events.RESUME, () => {
            current.state.input?.configure(this)
        })

        this.events.on(Phaser.Scenes.Events.PAUSE, () => {
            current.state.input?.removeFromScene(this)
        })
        current.state.input = new Input.KeyboardInputHandler()
        current.state.input?.configure(this)

        let startingX = 200
        let offset = 200
        this.characterSprites = this.characters.map((character) => {
            let sprite = this.add.sprite(startingX, 300, character.select.key)
            sprite.setScale(3)
            sprite.anims.create({
                key: 'bounce',
                frames: this.anims.generateFrameNumbers(character.select.key, { frames: [0, 1, 2, 3, 4, 5]}),
                frameRate: 9,
                repeat: -1,
            })
            sprite.play("bounce")
            startingX += offset
            return sprite
        })

        this.wand = this.add.sprite(this.offsetForIndex[0], 400, CharacterSelect.wand.key)
        this.wand.setScale(3)
        this.wand.anims.create({
            key: 'select',
            frames: this.anims.generateFrameNumbers(CharacterSelect.wand.key, { frames: [0, 1, 2, 3, 0]}),
            frameRate: 8,
            repeat: 0,
        })
    }

    next() {
        if (this.currentIndex >= this.characters.length - 1) {
            this.currentIndex = 0
        } else {
            this.currentIndex += 1
        }
        this.updateWandPosition()
    }

    prev() {
        if (this.currentIndex <= 0) {
            this.currentIndex = this.characters.length - 1
        } else {
            this.currentIndex -= 1
        }
        this.updateWandPosition()
    }

    updateWandPosition() {
        let offset = this.offsetForIndex[this.currentIndex]
        console.log("offset" + offset)
        this.wand?.setX(offset)
    }

    update(time, delta) {
        if (current.state.input != null) {
            let inputUpdate = current.state.input.update(time, delta)
            this.inputReducer.add(inputUpdate, time)
            if (inputUpdate != null && this.inputReducer.isNewInput()) {
                if (R.includes(Input.Action.ATTACK, inputUpdate.actions)) {
                    this.wand?.play("select")
                    this.setCurrentCharacter()
                } else if (R.includes(Movement.HorizontalMovement.LEFT, inputUpdate.horizontal)) {
                    this.prev()
                } else if (R.includes(Movement.HorizontalMovement.RIGHT, inputUpdate.horizontal)) {
                    this.next()
                }
            }
        }
    }

    setCurrentCharacter() {
        if (this.playerOne == null) {
            this.playerOne = this.characters[this.currentIndex]
            this.characterSprites[this.currentIndex].stop()
        } else {
            this.playerTwo = this.characters[this.currentIndex]
            current.state.match = new Match(
                this.playerOne,
                this.playerTwo
            )
            console.log(current.state.match)
            this.scene.manager?.pause(CharacterSelectScene.key)
            this.scene.manager?.start(FightScene.key)
        }
    }
}

type InputUpdateWithTime = [Input.InputUpdate, number]

class InputReducer {

    isNewInput() {
        return this.inputs.length === 1
    }

    inputs: Array<InputUpdateWithTime> = []
    add(input: Input.InputUpdate | null, time: number) {
        if (input == null) {
            this.inputs = []
        } else {
            if (this.inputs.length === 0) {
                this.inputs.push([input, time])
            } else {
                let lastIndex = this.inputs.length - 1
                let lastInput = this.inputs[lastIndex]
                if (lastInput[0].equals(input)) {
                    this.inputs.push([input, time])
                } else {
                    this.inputs = [[input, time]]
                }
            }
        }
    }


}