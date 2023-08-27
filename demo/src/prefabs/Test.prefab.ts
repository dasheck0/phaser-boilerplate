import { RegisterPrefab } from '@dasheck0/phaser-boilerplate';

@RegisterPrefab('Test')
export default class TestPrefab {
  constructor() {
    console.log('TestPrefab');
  }
}
