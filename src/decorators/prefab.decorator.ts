export default function Prefab(identifier: string) {
  return function (target: any) {
    Object.defineProperty(target, 'identifier', {
      value: identifier,
      configurable: false,
    });

    // move prefab loading here
  };
}