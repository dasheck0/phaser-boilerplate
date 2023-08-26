import Phaser from 'phaser';

import Config from './config';
import TestScene from './scenes/TestScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: Config.getInstance().enviroment.dimension.width,
  height: Config.getInstance().enviroment.dimension.height,
  backgroundColor: Config.getInstance().enviroment.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [TestScene],
};

const game = new Phaser.Game(config);

game.scene.start('test', {
  configFile: 'scenes/test.scene.json',
});

export default game;
