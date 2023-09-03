import { GameState, ImageButton, PrefabStore } from '@dasheck0/phaser-boilerplate';

export default class First extends GameState {
  private readonly name = 'First';

  canTransitionTo(): string[] {
    return ['Second', 'First'];
  }

  onEnter(): void {
    console.log('on enter first');

    PrefabStore.getInstance()
      .getPrefab<ImageButton>('switchToSecond')
      .onClick(() => {
        this.finiteStateMachine?.transitionTo('Second');
      });
  }

  onExit(): void {}

  update(): void {
    console.log('First gamestate');
  }

  getName(): string {
    return this.name;
  }
}
