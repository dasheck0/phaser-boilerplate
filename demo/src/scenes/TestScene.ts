import { BaseScene } from '@dasheck0/phaser-boilerplate';
import First from './gamestates/First';
import Second from './gamestates/Second';

export default class TestScene extends BaseScene {
  constructor() {
    super('test');
  }

  protected postCreate(): void {
    this.stateMachine.registerGameStates([new First(), new Second()], 'First');
  }
}
