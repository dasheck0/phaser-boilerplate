import { Asset } from './asset.type';
import { Prefab } from './prefab.type';

export interface SceneConfiguration {
  assets: Asset[];
  scenes: string[];
  groups: string[];
  prefabs: Prefab<any>[];
}

export interface SceneData {
  configFile: string;
}