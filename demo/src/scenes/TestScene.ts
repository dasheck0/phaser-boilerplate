import { BaseScene, ImageButton, PrefabStore } from '@dasheck0/phaser-boilerplate';

export default class TestScene extends BaseScene {
  constructor() {
    super('test');
  }

  protected postCreate(): void {
    console.log('postCreate');

    PrefabStore.getInstance().getPrefab<ImageButton>('pauseButton').initialize();
    PrefabStore.getInstance().getPrefab<ImageButton>('panel').initialize();

    console.log(PrefabStore.getInstance().getPrefab('pauseButton'));

    console.log(PrefabStore.getInstance());
  }
}
