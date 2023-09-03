import * as Phaser from 'phaser';
import FiniteStateMachine from '../gamestates/GameState';
import { PrefabStore } from '../prefabs/PrefabStore';
import { Asset, ScenePluginAsset, SpriteSheetAsset } from '../types/asset.type';
import { SceneConfiguration, SceneData } from '../types/scene.type';

export interface GroupDefinition {
  name: string;
  depth: number;
  group: Phaser.GameObjects.Group;
}

export interface SceneDefinition {
  name: string;
  scene: Phaser.Scene;
}

export abstract class BaseScene extends Phaser.Scene {
  private configFile: string;
  protected configuration?: SceneConfiguration;

  protected groups: GroupDefinition[] = [];
  protected scenes: SceneDefinition[] = [];

  protected stateMachine: FiniteStateMachine;

  constructor(key: string) {
    super(key);

    this.configFile = '';
    this.stateMachine = new FiniteStateMachine(this);
  }

  init(options: SceneData) {
    this.configFile = options.configFile;
  }

  preload() {
    this.load.on('filecomplete-json-config', () => {
      this.configuration = this.cache.json.get('config');
      this.loadAssets();
    });

    this.load.json('config', this.configFile);
  }

  create() {
    this.loadGroups();
    this.loadScenes();
    this.loadPrefabs().then(() => this.postCreate());
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    this.stateMachine.update();
  }

  protected abstract postCreate(): void;

  getGroup(name: string): GroupDefinition | undefined {
    return this.groups.find(group => group.name === name);
  }

  private loadAssets() {
    if (this.configuration) {
      this.configuration.assets.forEach((asset: Asset) => {
        switch (asset.type) {
          case 'image':
            this.load.image(asset.name, asset.url);
            break;

          case 'spritesheet':
            const spritesheet = asset as SpriteSheetAsset;

            this.load.spritesheet(asset.name, asset.url, {
              frameWidth: spritesheet.frameWidth,
              frameHeight: spritesheet.frameHeight,
            });
            break;

          case 'audio':
            this.load.audio(asset.name, asset.url);
            break;

          case 'plugin':
            if (!this.plugins.plugins.find(plugin => plugin.key === asset.name)) {
              this.load.plugin(asset.name, asset.url, true, '');
            }
            break;

          case 'sceneplugin':
            const scenePlugin = asset as ScenePluginAsset;

            this.load.scenePlugin({
              key: scenePlugin.name,
              url: scenePlugin.url,
              sceneKey: scenePlugin.sceneKey,
            });
            break;

          case 'script':
            this.load.script(asset.name, asset.url);
            break;

          default:
            throw new Error(`Asset type ${asset.type} not supported`);
        }
      });
    }
  }

  private loadGroups() {
    if (this.configuration) {
      this.configuration.groups.forEach((group: string, index: number) => {
        const groupToAdd = this.add.group();

        groupToAdd.setDepth(index + 1);
        groupToAdd.setName(group);
        groupToAdd.runChildUpdate = true;

        this.groups.push({
          name: group,
          depth: index,
          group: groupToAdd,
        });
      });
    }
  }

  private loadScenes() {
    if (this.configuration) {
      this.configuration.scenes.forEach((scene: string) => {
        const sceneToAdd = this.scene.get(scene);

        this.scene.launch(scene, {
          configFile: `assets/states/${scene}.json`,
        });

        this.scenes.push({
          name: scene,
          scene: sceneToAdd,
        });
      });
    }
  }

  private async loadPrefabs() {
    if (this.configuration) {
      // await PrefabStore.getInstance().loadPredefinedPrefabs();

      for (const name in this.configuration.prefabs) {
        const prefab = this.configuration.prefabs[name];
        PrefabStore.getInstance().instantiatePrefab(prefab.type, name, this, prefab.options);
      }
    }
  }
}
