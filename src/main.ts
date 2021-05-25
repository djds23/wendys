import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	input: { gamepad: true, keyboard: true },
	backgroundColor: "#ff0000",
	scene: [HelloWorldScene]
}

export default new Phaser.Game(config)
