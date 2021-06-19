import Phaser from 'phaser'

import FightScene from './scenes/Fight/FightScene'
import PauseScene from './scenes/PauseScene'
import CharacterSelectScene from './scenes/CharacterSelectScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	input: { gamepad: true, keyboard: true },
	backgroundColor: "#800080",
	scene: [CharacterSelectScene, FightScene, PauseScene]
}

export default new Phaser.Game(config)
