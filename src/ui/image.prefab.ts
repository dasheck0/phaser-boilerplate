import Prefab from '../decorators/prefab.decorator';
import BaseScene from '../scenes/BaseScene';
import SingleImageItem, { SingleImageItemOptions } from './singleImageItem';

export interface ImageOptions extends SingleImageItemOptions {
}

@Prefab('Image')
export default class Image extends SingleImageItem {
  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: ImageOptions) {
    super(name, scene, options);
  }
}
