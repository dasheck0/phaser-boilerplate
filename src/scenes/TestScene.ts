import { PrefabStore } from '../prefabs/PrefabStore';
import ImageButton from '../ui/imageButton.prefab';
import BaseScene from './BaseScene';

export default class TestScene extends BaseScene {
  constructor() {
    super('test');
  }

  protected postCreate(): void {
    console.log('postCreate');

    PrefabStore.getInstance().getPrefab<ImageButton>('pauseButton').initialize();
    PrefabStore.getInstance().getPrefab<ImageButton>('panel').initialize();

    console.log(PrefabStore.getInstance().getPrefab('pauseButton'));
  }
}
