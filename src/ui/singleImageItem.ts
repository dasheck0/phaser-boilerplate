import { Config } from '../config';
import { BaseScene } from '../scenes/BaseScene';
import { Vector2 } from '../types/math.type';
import { UI, UIOptions } from './ui';

export interface SingleImageItemOptions extends UIOptions {
  key: string;
  imageAnchor?: Vector2;
  maxWidth?: number;
  maxHeight?: number;
  alignSelf?: 'start' | 'center' | 'end';
  vAlignSelf?: 'start' | 'center' | 'end';
}

export class SingleImageItem extends UI {
  protected image?: Phaser.GameObjects.Sprite;

  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: SingleImageItemOptions) {
    super(name, scene, options);
  }

  public override layout(parent?: UI): void {
    super.layout(parent);

    this.image = this.scene.add.sprite(this.position.x, this.position.y, this.options.key);
    this.addToGroup([this.image]);
    this.repositionImage();

    console.log('actual depth: ' + this.depth, this.name);

    if (Config.getInstance().enviroment.debug) {
      this.debugGraphics.clear();
      this.debugGraphics.strokeRect(this.position.x, this.position.y, this.dimension.width, this.dimension.height);
    }
  }

  private repositionImage(): void {
    if (this.image) {
      this.image.setOrigin(this.options.imageAnchor?.x || 0, this.options.imageAnchor?.y || 0);

      // reclculate width and height, so that the largest site does not exceed parent width or height while maintaining aspect ratio
      const width = this.dimension.width - (this.options.padding?.left ?? 0) - (this.options.padding?.right ?? 0);
      const height = this.dimension.height - (this.options.padding?.top ?? 0) - (this.options.padding?.bottom ?? 0);

      const ratio = Math.min(
        Math.min(width, this.options.maxWidth || Number.MAX_SAFE_INTEGER) / this.image.width,
        Math.min(height, this.options.maxHeight || Number.MAX_SAFE_INTEGER) / this.image.height,
      );

      this.image.setScale(ratio, ratio);

      // calculate the position of the image based on the alignment
      if (this.options.alignSelf === 'center') {
        this.image.setX(this.position.x + width / 2);
      }

      if (this.options.alignSelf === 'end') {
        this.image.setX(this.position.x + width);
      }

      if (this.options.vAlignSelf === 'center') {
        this.image.setY(this.position.y + height / 2);
      }

      if (this.options.vAlignSelf === 'end') {
        this.image.setY(this.position.y + height);
      }
    }
  }

  public populateChildren(): void {}
}
