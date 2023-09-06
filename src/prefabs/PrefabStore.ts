import { BaseScene } from '../scenes/BaseScene';
import { BaseOptions } from './base';

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

    if (!prefab) {
      throw new Error(`Prefab ${id} not found`);
    }

    return prefab as T;
  }

  public getPrefabs<T>(): T[] {
    return Object.values(this.prefabs) as T[];
  }

  // public async loadPredefinedPrefabs() {
  //   await this.loadPrefabs('../**/*.prefab.ts');
  // }

  // public async loadCustomPrefabs(path: string) {
  //   await this.loadPrefabs(path);
  // }

  // private async loadPrefabs2(path: string) {
  //   const modules = await import.meta.glob(path);

  //   for (const path in modules) {
  //     const module = (await modules[path]()) as PrefabModule;
  //     const key = module.default.identifier;
  //     this.prefabClasses[key] = module.default;
  //   }
  // }

  public async loadPrefabs(modules: Record<string, () => Promise<unknown>>) {
    for (const path in modules) {
      const module = (await modules[path]()) as PrefabModule;
      const key = module.default.identifier;
      this.prefabClasses[key] = module.default;
    }
  }

  public loadPrefab(id: string, prefab: BaseClass<any>) {
    this.prefabClasses[id] = prefab;
  }
}
