import Phaser from 'phaser';

export const hexColorToNumber = (color: string): number => {
  return Phaser.Display.Color.HexStringToColor(color).color;
};
