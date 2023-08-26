import Prefab from '../decorators/prefab.decorator';
import { PrefabStore } from '../prefabs/PrefabStore';
import BaseScene from '../scenes/BaseScene';
import UI, { UIOptions } from './ui';

export interface AutoLayoutOptions extends UIOptions {
  direction: 'horizontal' | 'vertical';
}

@Prefab('AutoLayout')
export default class AutoLayout extends UI {
  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: AutoLayoutOptions) {
    super(name, scene, options);
  }

  public populateChildren(): void {
    if (this.options.children) {
      this.options.children.forEach((options: UIOptions, index: number) => {
        if (this.options.direction === 'horizontal') {
          options.position = {
            x: index / this.options.children!!.length,
            y: this.position.y,
            relative: true,
          };

          options.width = {
            value: 1 / this.options.children!!.length,
            relative: true,
          };

          options.height = {
            value: 1,
            relative: true,
          };
        } else {
          options.position = {
            x: this.position.x,
            y: index / this.options.children!!.length,
            relative: true,
          };

          options.width = {
            value: 1,
            relative: true,
          };

          options.height = {
            value: 1 / this.options.children!!.length,
            relative: true,
          };
        }

        const prefab = PrefabStore.getInstance().instantiatePrefab<UI>(options.type, `${this.name}.${index}`, this.scene, options);

        prefab.populateChildren();

        this.children.push(prefab);
      });
    }
  }
}
