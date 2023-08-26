export const assetTypes = ['image', 'plugin', 'sceneplugin', 'audio', 'spritesheet', 'script'] as const;
export type AssetType = typeof assetTypes[number];

export interface Asset {
  name: string;
  type: AssetType;
  url: string;
}

export interface ImageAsset extends Asset {
  type: 'image';
}

export interface PluginAsset extends Asset {
  type: 'plugin';
}

export interface ScenePluginAsset extends Asset {
  type: 'sceneplugin';
  sceneKey: string;
}

export interface AudioAsset extends Asset {
  type: 'audio';
}

export interface SpriteSheetAsset extends Asset {
  type: 'spritesheet';
  frameWidth: number;
  frameHeight: number;
  frames: number;
}

export interface ScriptAsset extends Asset {
  type: 'script';
}