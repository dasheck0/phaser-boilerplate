import { PrefabStore } from '../prefabs/PrefabStore';

export default function RegisterPrefab(identifier: string) {
  return function (target: any) {
    Object.defineProperty(target, 'identifier', {
      value: identifier,
      configurable: false,
    });

    PrefabStore.getInstance().loadPrefab(identifier, target);
  };
}
