import { Config } from '../config';
import RegisterPrefab from '../decorators/prefab.decorator';
import { BaseScene } from '../scenes/BaseScene';
import { UI, UIOptions } from './ui';

export const textTypesArray = ['tiny', 'small', 'body', 'subheading', 'heading', 'display1', 'display2', 'display3', 'display4'] as const;
export type TextType = (typeof textTypesArray)[number];

export type Scale =
  | 'minor_second'
  | 'major_second'
  | 'minor_third'
  | 'major_third'
  | 'perfect_fourth'
  | 'augmented_fourth'
  | 'perfect_fifth'
  | 'golden_ratio';

export interface TextOptions extends UIOptions {
  text: string;
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

@RegisterPrefab('Text')
export default class TextPrefab extends UI {
  protected text?: Phaser.GameObjects.Text;

  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: TextOptions) {
    super(name, scene, options);
  }

  public shutdown(): void {}

  public override layout(parent?: UI): void {
    super.layout(parent);

    this.text = this.scene.add.text(this.position.x, this.position.y, this.options.text, {
      fontFamily: this.options.fontFamily || Config.getInstance().enviroment.typography.fontFamily,
      fontSize: this.calculateFontSize(),
      color: this.options.fontColor || '#000000',
    });

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
  }

  public populateChildren(): void {}

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
