import { BaseScene } from '../scenes/BaseScene';

export abstract class GameState {
  protected finiteStateMachine: FiniteStateMachine | null;

  constructor() {
    this.finiteStateMachine = null;
  }

  setFiniteStateMachine(finiteStateMachine: FiniteStateMachine) {
    this.finiteStateMachine = finiteStateMachine;
  }

  abstract canTransitionTo(): string[];

  abstract onEnter(): void;

  abstract onExit(): void;

  abstract update(): void;

  abstract getName(): string;
}

export default class FiniteStateMachine {
  private currentState: GameState | null;
  private initialGameStateName: string | null;
  private states: GameState[];

  constructor(private readonly scene: BaseScene) {
    this.currentState = null;
    this.initialGameStateName = null;

    this.states = [];
  }

  public getBaseScene(): BaseScene {
    return this.scene;
  }

  public registerGameStates(states: GameState[], initialGameStateName: string) {
    this.initialGameStateName = initialGameStateName;
    this.states = states;

    this.states.forEach(state => {
      state.setFiniteStateMachine(this);
    });

    this.currentState = this.getInitialState();
    this.currentState.onEnter();
  }

  public update() {
    this.currentState?.update();
  }

  public transitionTo(stateName: string) {
    if (this.currentState?.canTransitionTo().includes(stateName)) {
      this.currentState.onExit();
      this.currentState = this.getStateByName(stateName);
      this.currentState.onEnter();
    }
  }

  private getInitialState(): GameState {
    if (this.initialGameStateName) {
      const state = this.states.find(state => state.getName() === this.initialGameStateName);

      if (state) {
        return state;
      }
    }

    throw new Error('Initial game state not found');
  }

  private getStateByName(stateName: string): GameState {
    const state = this.states.find(state => state.getName() === stateName);

    if (state) {
      return state;
    }

    throw new Error('State not found');
  }
}
