import RegisterPrefab from '../decorators/prefab.decorator';
import { BaseScene } from '../scenes/BaseScene';
import { SingleImageItem, SingleImageItemOptions } from './singleImageItem';
import { UI } from './ui';

export interface ImageButtonOptions extends SingleImageItemOptions {
  animation: 'none' | 'pinch' | 'tint';
  animationDuration?: number;
}

@RegisterPrefab('ImageButton')
export default class ImageButton extends SingleImageItem {
  private onClicked?: () => void;
  private onClickedContext?: any;

  private isClicked = false;

  constructor(protected readonly name: string, protected readonly scene: BaseScene, protected readonly options: ImageButtonOptions) {
    super(name, scene, options);
  }

  public override layout(parent?: UI): void {
    super.layout(parent);

    if (this.image) {
      this.image.setInteractive();

      this.image.on('pointerup', () => {
        if (!this.isClicked) {
          this.isClicked = true;
          const animationType = this.options.animation ?? 'tint';

          if (animationType === 'pinch' && this.image) {
            this.scene.tweens.add({
              targets: this.image,
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
              targets: this.image,
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
    }
  }

  public onClick(onClicked: () => void, onClickedContext?: any) {
    this.onClicked = onClicked;
    this.onClickedContext = onClickedContext;
  }
}
