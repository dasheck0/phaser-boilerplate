export interface BaseOptions {
  type: string;
}

export interface BasePrefab {
  initialize(): void;
  shutdown(): void;
}
