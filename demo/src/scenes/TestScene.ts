import { AutoLayout, BaseScene, PrefabStore } from '@dasheck0/phaser-boilerplate';

export default class TestScene extends BaseScene {
  constructor() {
    super('test');
  }

  protected postCreate(): void {
    console.log('postCreate');

    PrefabStore.getInstance().getPrefab<AutoLayout>('rows').initialize();
    PrefabStore.getInstance().getPrefab<AutoLayout>('panel').initialize();

    console.log(PrefabStore.getInstance());
  }
}
