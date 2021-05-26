import Phaser from 'phaser'

import FightScene from './scenes/FightScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 2000 },
			debug: true
		}
	},
	input: { gamepad: true, keyboard: true },
	backgroundColor: "#ff0000",
	scene: [FightScene]
}

export default new Phaser.Game(config)
