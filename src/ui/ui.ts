import { Config } from '../config';
import { BaseScene } from '../scenes/BaseScene';
import { Dimension2, Position, Vector2 } from '../types/math.type';
import { randomColor } from '../utilities/random';

export interface UIOptions {
  type: string;
  position: Position;
  anchor?: Vector2;
  group?: string;
  name?: string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  width?: {
    value: number;
    ignoreMargin?: boolean;
    relative?: boolean;
  };
  height?: {
    value: number;
    ignoreMargin?: boolean;
    relative?: boolean;
  };
  children?: UIOptions[];
}

export abstract class UI {
  public position: Vector2;
  public dimension: Dimension2;
  protected children: UI[] = [];
  protected parent?: UI;
  protected debugGraphics: Phaser.GameObjects.Graphics;
  public depth: number = 0;

  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: UIOptions) {
    this.position = { x: 0, y: 0 };
    this.dimension = { width: 0, height: 0 };

    this.debugGraphics = this.scene.add.graphics({
      ...this.position,
      lineStyle: { width: 1, color: randomColor() },
    });
  }

  public initialize() {
    this.populateChildren();
    this.layout();
  }

  public layout(parent?: UI) {
    const offset = parent ? parent.position : { x: 0, y: 0 };
    const dimension = parent ? parent.dimension : Config.getInstance().enviroment.dimension;

    this.calculatePosition(offset, dimension);
    this.calculateDimension(dimension);

    if (Config.getInstance().enviroment.debug) {
      this.debugGraphics.clear();
      this.debugGraphics.strokeRect(this.position.x, this.position.y, this.dimension.width, this.dimension.height);
    }

    this.children.forEach(child => child.layout(this));
  }

  public setParent(parent: UI) {
    this.parent = parent;

    if (parent.depth) {
      this.depth = parent.depth + 1;
    }
  }

  public abstract populateChildren(): void;

  protected calculatePosition(parentPosition: Vector2, parentDimension: Dimension2) {
    const x = this.options.position.relative ? this.options.position.x * parentDimension.width : this.options.position.x;
    const y = this.options.position.relative ? this.options.position.y * parentDimension.height : this.options.position.y;

    this.position = {
      x: x + (this.options.margin?.left || 0) + parentPosition.x - (this.options.margin?.right || 0),
      y: y + (this.options.margin?.top || 0) + parentPosition.y - (this.options.margin?.bottom || 0),
    };
  }

  protected calculateDimension(parentDimension: Dimension2) {
    if (this.options.width) {
      this.dimension.width = this.options.width.relative ? this.options.width.value * parentDimension.width : this.options.width.value;
    } else {
      this.dimension.width = parentDimension.width - this.position.x;
    }

    if (this.options.height) {
      this.dimension.height = this.options.height.relative ? this.options.height.value * parentDimension.height : this.options.height.value;
    } else {
      this.dimension.height = parentDimension.height - this.position.y;
    }

    if (this.options.anchor) {
      this.position.x -= this.options.anchor.x * this.dimension.width;
      this.position.y -= this.options.anchor.y * this.dimension.height;
    }
  }

  protected addToGroup(items: (Phaser.GameObjects.Graphics | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text)[]) {
    const groupName = this.getGroupNameUntilParent();

    if (groupName) {
      const group = this.scene.getGroup(groupName);

      if (group) {
        items.forEach(item => {
          const depth = parseFloat('1.' + '1'.repeat(this.depth));
          item.setDepth(group.depth * depth);

          group.group.add(item);
        });
      }
    } else {
      console.warn(`Could not add items to group, because no group name was found for "${this.name}"`);
    }
  }

  protected getGroupNameUntilParent(): string | undefined {
    if (this.options.group) {
      return this.options.group;
    }

    if (this.parent) {
      return this.parent.getGroupNameUntilParent();
    }

    return undefined;
  }
}
