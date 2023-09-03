import { GameState, ImageButton, PrefabStore } from '@dasheck0/phaser-boilerplate';

export default class Second extends GameState {
  private readonly name = 'Second';

  canTransitionTo(): string[] {
    return ['First'];
  }

  onEnter(): void {
    console.log('on enter second');

    PrefabStore.getInstance()
      .getPrefab<ImageButton>('switchToFirst')
      .onClick(() => {
        this.finiteStateMachine?.transitionTo('First');
      });
  }

  onExit(): void {}

  update(): void {
    console.log('Second gamestate');
  }

  getName(): string {
    return this.name;
  }
}
