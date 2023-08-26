import BaseScene from '../scenes/BaseScene';
import { BaseOptions } from './base';
import BaseSprite from './sprite.prefab';

console.log('BaseSprite', BaseSprite);

export type BaseClass<T extends BaseOptions> = {
  new (name: string, scene: BaseScene, options: T): any;
  identifier: string;
};

type PrefabModule = {
  default: BaseClass<BaseOptions>;
};

export class PrefabStore {
  private static instance: PrefabStore;
  private constructor() {}

  private prefabs: { [key: string]: any } = {};
  private prefabClasses: { [key: string]: BaseClass<any> } = {};

  public static getInstance(): PrefabStore {
    if (!this.instance) {
      this.instance = new PrefabStore();
    }

    return this.instance;
  }

  public instantiatePrefab<T>(id: string, name: string, scene: BaseScene, options: BaseOptions): T {
    const prefab = this.prefabClasses[id];

    if (!prefab) {
      throw new Error(`PrefabClass ${id} not found`);
    }

    const newPrefab = new prefab(name, scene, options);
    this.prefabs[name] = newPrefab;

    return newPrefab as T;
  }

  public getPrefab<T>(id: string): T {
    const prefab = this.prefabs[id];

    console.log('prefab', this.prefabs, prefab);

    if (!prefab) {
      throw new Error(`Prefab ${id} not found`);
    }

    return prefab as T;
  }

  public async loadPrefabs() {
    const modules = await import.meta.glob('../**/*.prefab.ts');
    console.log('models', modules);

    for (const path in modules) {
      const module = (await modules[path]()) as PrefabModule;
      const key = module.default.identifier;
      this.prefabClasses[key] = module.default;

      console.log('Loaded prefab', key, module.default);
    }
  }
}
