import { Config } from '../config';
import RegisterPrefab from '../decorators/prefab.decorator';
import { BaseScene } from '../scenes/BaseScene';
import { Position, Vector2 } from '../types/math.type';
import { calculatePosition } from '../utilities/position';
import { BaseOptions, BasePrefab } from './base';

export interface SpriteOptions extends BaseOptions {
  key: string;
  position: Position;
  group: string;
  anchor?: Vector2;
  scale?: Vector2;
  angle?: number;
  alpha?: number;
}

@RegisterPrefab('Sprite')
export default class Sprite extends Phaser.Physics.Arcade.Sprite implements BasePrefab {
  constructor(public readonly name: string, public readonly scene: BaseScene, protected readonly options: SpriteOptions) {
    super(scene, options.position.x, options.position.y, options.key);

    const { x, y } = calculatePosition(options.position, Config.getInstance().enviroment.dimension);
    this.setPosition(x, y);

    if (options.anchor) {
      this.setOrigin(options.anchor.x, options.anchor.y);
    }

    if (options.scale) {
      this.setScale(options.scale.x, options.scale.y);
    }

    if (options.angle) {
      this.setAngle(options.angle);
    }

    if (options.alpha || options.alpha === 0) {
      this.setAlpha(options.alpha);
    }

    const group = scene.getGroup(options.group);
    if (group) {
      this.setDepth(group.depth);
      group.group.add(this);
    }

    this.scene.add.existing(this);
  }

  initialize(): void {
  }
}
