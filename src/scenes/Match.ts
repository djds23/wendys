import { CharacterAsset } from '~/Assets'

export default class Match {
    character1: CharacterAsset
    character2: CharacterAsset
    constructor(
        character1: CharacterAsset,
        character2: CharacterAsset
        ) {
            this.character1 = character1
            this.character2 = character2
        }
}