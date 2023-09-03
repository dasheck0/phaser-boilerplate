import { AutoLayout, BaseScene, PrefabStore } from '@dasheck0/phaser-boilerplate';
import First from './gamestates/First';
import Second from './gamestates/Second';

export default class TestScene extends BaseScene {
  constructor() {
    super('test');
  }

  protected postCreate(): void {
    PrefabStore.getInstance().getPrefab<AutoLayout>('rows').initialize();
    PrefabStore.getInstance().getPrefab<AutoLayout>('panel').initialize();

    this.stateMachine.registerGameStates([new First(), new Second()], 'First');
  }
}
