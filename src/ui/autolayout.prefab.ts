import RegisterPrefab from '../decorators/prefab.decorator';
import { PrefabStore } from '../prefabs/PrefabStore';
import { BaseScene } from '../scenes/BaseScene';
import { hexColorToNumber } from '../utilities/transformation';
import { validateHexColorString } from '../utilities/validation';
import { UI, UIOptions } from './ui';

export interface AutoLayoutOptions extends UIOptions {
  direction: 'horizontal' | 'vertical';
  backgroundColor?: string;
  backgroundAlpha?: number;
}

@RegisterPrefab('AutoLayout')
export default class AutoLayout extends UI {
  private background?: Phaser.GameObjects.Graphics;

  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: AutoLayoutOptions) {
    super(name, scene, options);
  }

  public override layout(parent?: UI): void {
    super.layout(parent);

    if (this.options.backgroundColor && validateHexColorString(this.options.backgroundColor)) {
      this.background = this.scene.add.graphics({
        fillStyle: { color: hexColorToNumber(this.options.backgroundColor), alpha: this.options.backgroundAlpha ?? 1 },
      });

      this.background.fillRect(this.position.x, this.position.y, this.dimension.width, this.dimension.height);
      this.addToGroup([this.background]);
    }
  }

  public populateChildren(): void {
    if (this.options.children) {
      this.options.children.forEach((options: UIOptions, index: number) => {
        this.options.group = this.getGroupNameUntilParent();
        this.depth = this.parent ? this.parent.depth + 1 : 1;

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

        const name = options.name ?? `${this.name}.${index}`;
        const prefab = PrefabStore.getInstance().instantiatePrefab<UI>(options.type, name, this.scene, options);

        prefab.setParent(this);
        prefab.populateChildren();

        this.children.push(prefab);
      });
    }
  }
}
