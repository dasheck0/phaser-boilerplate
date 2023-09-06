import { Config } from '../config';
import RegisterPrefab from '../decorators/prefab.decorator';
import { BaseScene } from '../scenes/BaseScene';
import { Vector2 } from '../types/math.type';
import { Scale, TextOptions, TextType, textTypesArray } from './text.prefab';
import { UI, UIOptions } from './ui';

export interface TextButtonOptions extends UIOptions {
  key: string;
  text: string;
  imageAnchor?: Vector2;
  maxWidth?: number;
  maxHeight?: number;
  alignSelf?: 'start' | 'center' | 'end';
  vAlignSelf?: 'start' | 'center' | 'end';
  textAlign?: 'left' | 'center' | 'right';
  vTextAlign?: 'top' | 'center' | 'bottom';
  textAnchor?: Vector2;
  animation: 'none' | 'pinch' | 'tint';
  animationDuration?: number;
  typo?: TextType;
  scale?: Scale;
  baseFontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  strokeColor?: string;
  strokeWidth?: number;
  wordwrap?: {
    width: number;
    useAdvancedWrap: boolean;
  };
  shadow?: {
    x: number;
    y: number;
    color: string;
    blur: number;
    enableStroke: boolean;
    enableFill: boolean;
  };
}

@RegisterPrefab('TextButton')
export default class TextButton extends UI {
  protected image?: Phaser.GameObjects.Sprite;
  protected text?: Phaser.GameObjects.Text;

  private onClicked?: () => void;
  private onClickedContext?: any;

  private isClicked = false;

  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: TextButtonOptions) {
    super(name, scene, options);
  }

  public populateChildren(): void {}

  public shutdown(): void {}

  public onClick(onClicked: () => void, onClickedContext?: any) {
    this.onClicked = onClicked;
    this.onClickedContext = onClickedContext;
  }

  public override layout(parent?: UI): void {
    super.layout(parent);

    this.image = this.scene.add.sprite(this.position.x, this.position.y, this.options.key);
    this.addToGroup([this.image]);
    this.repositionImage();

    this.image.setInteractive();

    this.image.on('pointerup', () => {
      if (!this.isClicked) {
        this.isClicked = true;
        const animationType = this.options.animation ?? 'tint';

        if (animationType === 'pinch' && this.image) {
          this.scene.tweens.add({
            targets: [this.image, this.text],
            scaleX: this.image.scaleX * 1.1,
            scaleY: this.image.scaleY * 1.1,
            ease: 'Cubic',
            duration: this.options.animationDuration ?? 50,
            yoyo: true,
            onComplete: () => {
              this.isClicked = false;
              this.onClicked?.call(this.onClickedContext);
            },
          });
        }

        if (animationType === 'tint' && this.image) {
          this.scene.tweens.add({
            targets: [this.image, this.text],
            alpha: { from: 1, to: 0.8 },
            ease: 'Cubic',
            duration: this.options.animationDuration ?? 50,
            yoyo: true,
            onComplete: () => {
              this.isClicked = false;
              this.onClicked?.call(this.onClickedContext);
            },
          });
        }
      }
    });

    this.text = this.scene.add.text(this.position.x, this.position.y, this.options.text, {
      fontFamily: this.options.fontFamily || Config.getInstance().enviroment.typography.fontFamily,
      fontSize: this.calculateFontSize(),
      color: this.options.fontColor || '#000000',
    });

    this.repositionText();
    this.addToGroup([this.text]);

    if (this.options.strokeColor || this.options.strokeWidth) {
      this.text.setStroke(this.options.strokeColor || '#000', this.options.strokeWidth || 1);
    }

    if (this.options.shadow) {
      this.text.setShadow(
        this.options.shadow.x,
        this.options.shadow.y,
        this.options.shadow.color,
        this.options.shadow.blur,
        this.options.shadow.enableStroke,
        this.options.shadow.enableFill,
      );
    }

    if (this.options.wordwrap) {
      this.text.setWordWrapWidth(this.options.wordwrap.width, this.options.wordwrap.useAdvancedWrap);
    }

    if (Config.getInstance().enviroment.debug) {
      this.debugGraphics.clear();
      this.debugGraphics.strokeRect(this.position.x, this.position.y, this.dimension.width, this.dimension.height);
    }

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

  private repositionText(): void {
    if (this.text && this.image) {
      this.text.setOrigin(this.options.textAnchor?.x || 0, this.options.textAnchor?.y || 0);

      const width = this.dimension.width - (this.options.padding?.left ?? 0) - (this.options.padding?.right ?? 0);
      const height = this.dimension.height - (this.options.padding?.top ?? 0) - (this.options.padding?.bottom ?? 0);

      const actualWidth = Math.min(width, this.options.maxWidth || Number.MAX_SAFE_INTEGER);
      const actualHeight = Math.min(height, this.options.maxHeight || Number.MAX_SAFE_INTEGER);

      if (this.options.textAlign === 'center') {
        this.text.setX(this.position.x + actualWidth / 2);
      }

      if (this.options.textAlign === 'right') {
        this.text.setX(this.position.x + actualWidth);
      }

      if (this.options.vTextAlign === 'center') {
        this.text.setY(this.position.y + actualHeight / 2);
      }

      if (this.options.vTextAlign === 'bottom') {
        this.text.setY(this.position.y + actualHeight);
      }
    }
  }

  private calculateFontSize(): number {
    const {
      scale = Config.getInstance().enviroment.typography.scale,
      baseFontSize = Config.getInstance().enviroment.typography.baseFontSize,
      typo = 'body',
    } = this.options as TextOptions;
    const typeIndex = textTypesArray.indexOf(typo);

    const scaleMap = {
      minor_second: 16 / 15,
      major_second: 9 / 8,
      minor_third: 6 / 5,
      major_third: 5 / 4,
      perfect_fourth: 4 / 3,
      augmented_fourth: Math.sqrt(2),
      perfect_fifth: 3 / 2,
      golden_ratio: 1.61803398875,
    };

    return baseFontSize * scaleMap[scale] ** (typeIndex - 2);
  }
}
