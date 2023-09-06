export interface BaseOptions {}

export interface BasePrefab {
  initialize(): void;
  shutdown(): void;
}
