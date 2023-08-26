export interface Vector2 {
  x: number;
  y: number;
}

export interface Position extends Vector2 {
  relative?: boolean;
}

export interface Dimension2 {
  width: number;
  height: number;
}