import Phaser from 'phaser';

import TestScene from './scenes/TestScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
		},
	},
	scene: [TestScene],
}



const game = new Phaser.Game(config)

game.scene.start('test', {
	configFile: 'scenes/test.scene.json'
});

export default game;